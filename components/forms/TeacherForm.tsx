"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LANGUAGES_ENUM_VALUES } from "@/lib/constants";
import { HeadsetIcon } from "@/svgs/HeadsetIcon";
import ReactCountryFlag from "react-country-flag";
import { getData } from "country-list";
import { createTeacher } from "@/actions/teacher-actions";
import { createCommission } from "@/actions/commission-actions";

interface TeacherFormData {
  name: string;
  languages: string[];
  passport_number: string;
  country: string;
  phone: string;
}

interface CommissionData {
  rate: number;
  description: string;
}

interface FormFieldDescriptor {
    key: keyof TeacherFormData;
    label: string;
    type: 'text' | 'tel';
    required: boolean;
    placeholder?: string;
}

const FORM_FIELDS: FormFieldDescriptor[] = [
    { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Full name' },
    { key: 'passport_number', label: 'Passport Number', type: 'text', required: false, placeholder: 'ABC123456' },
    { key: 'phone', label: 'Phone', type: 'tel', required: false, placeholder: 'Phone number' },
] as const;

export function TeacherForm({
    onSubmit
}: {
    onSubmit?: (data: any) => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('ES'); // Spain's country code
    const [formData, setFormData] = useState<TeacherFormData>({
        name: '',
        passport_number: '',
        phone: '',
        country: 'Spain',
        languages: [],
    });
    const [commissions, setCommissions] = useState<CommissionData[]>([]);
    
    // Get country data
    const countries = getData();

    const resetForm = () => {
        setFormData({
            name: '',
            passport_number: '',
            phone: '',
            country: 'Spain',
            languages: [],
        });
        setSelectedLanguages([]);
        setSelectedCountryCode('ES');
        setCommissions([]);
        setError(null);
    };

    // Check if form is ready to submit
    const isFormValid = () => {
        return formData.name && formData.name.trim() !== "" && selectedLanguages.length > 0;
    };

    const handleLanguageChange = (language: string, checked: boolean) => {
        if (checked) {
            setSelectedLanguages(prev => [...prev, language]);
        } else {
            setSelectedLanguages(prev => prev.filter(lang => lang !== language));
        }
    };

    const handleInputChange = (key: keyof TeacherFormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const addCommission = () => {
        setCommissions(prev => [...prev, { rate: 0, description: '' }]);
    };

    const removeCommission = (index: number) => {
        setCommissions(prev => prev.filter((_, i) => i !== index));
    };

    const updateCommission = (index: number, field: keyof CommissionData, value: any) => {
        setCommissions(prev => prev.map((commission, i) => 
            i === index ? { ...commission, [field]: value } : commission
        ));
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault();
            if (isFormValid()) {
                const form = event.currentTarget.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const data = {
                name: formData.name,
                passport_number: formData.passport_number || null,
                country: formData.country || null,
                phone: formData.phone || null,
                languages: selectedLanguages as any, // Cast to match schema enum type
            };

            console.log('Teacher data being submitted:', data);

            const result = await createTeacher(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create teacher');
            }

            const createdTeacher = result.data!;
            let createdCommissions: any[] = [];

            // Create commissions if any exist
            if (commissions.length > 0) {
                const validCommissions = commissions.filter(c => c.rate > 0);
                for (const commission of validCommissions) {
                    const commissionResult = await createCommission({
                        teacher_id: createdTeacher.id,
                        rate: commission.rate,
                        description: commission.description || undefined,
                    });
                    if (commissionResult.success) {
                        createdCommissions.push(commissionResult);
                    }
                }
            }

            // Create detailed success message
            let successMessage = `Teacher "${data.name}" created successfully!`;
            let description = `Teacher ID: ${createdTeacher.id}`;
            
            if (createdCommissions.length > 0) {
                description += ` • ${createdCommissions.length} commission${createdCommissions.length > 1 ? 's' : ''} created`;
            } else if (commissions.length > 0) {
                description += ` • No commissions created (rates must be > 0)`;
            } else {
                description += ` • No commissions added`;
            }

            toast.success(successMessage, {
                description,
                duration: 4000,
            });
            
            resetForm();
            if (onSubmit) onSubmit({ ...createdTeacher, commissions: createdCommissions });

        } catch (err: any) {
            console.error('Error creating teacher:', err);
            const errorMessage = err.message || "Failed to create teacher";
            setError(errorMessage);
            toast.error("Error Creating Teacher", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const renderField = (field: FormFieldDescriptor) => {
        return (
            <div key={field.key} className="flex flex-col gap-2 min-w-fit">
                <Label htmlFor={field.key} className="text-xs font-medium whitespace-nowrap">
                    {field.label}{field.required && <span className="text-red-500">*</span>}
                </Label>
                <Input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    required={field.required}
                    disabled={isLoading}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="h-9 w-32 text-sm"
                    placeholder={field.placeholder || field.label}
                />
            </div>
        );
    };

    return (
        <div className="w-full p-6">
            <Card className="w-full border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <HeadsetIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <CardTitle className="text-xl">Create Teacher</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* First Row: Name, Country, Phone, Passport, Languages */}
                        <div className="flex flex-wrap gap-4">
                            {/* Name - takes more space */}
                            <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                                <Label htmlFor="name" className="text-xs font-medium">
                                    Name<span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    value={formData.name || ''}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="Full name"
                                />
                            </div>

                            {/* Country */}
                            <div className="w-32 flex flex-col gap-2">
                                <Label className="text-xs font-medium">
                                    Country
                                </Label>
                                <div className="relative">
                                    <select
                                        value={selectedCountryCode}
                                        onChange={(e) => {
                                            const code = e.target.value;
                                            const country = countries.find(c => c.code === code);
                                            setSelectedCountryCode(code);
                                            handleInputChange('country', country?.name || '');
                                        }}
                                        disabled={isLoading}
                                        className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {countries.map((country) => (
                                            <option key={country.code} value={country.code}>
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <ReactCountryFlag
                                            countryCode={selectedCountryCode}
                                            svg
                                            style={{
                                                width: '1.2em',
                                                height: '1.2em',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="w-32 flex flex-col gap-2">
                                <Label htmlFor="phone" className="text-xs font-medium">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    disabled={isLoading}
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="Phone"
                                />
                            </div>

                            {/* Passport Number */}
                            <div className="w-36 flex flex-col gap-2">
                                <Label htmlFor="passport_number" className="text-xs font-medium">
                                    Passport Number
                                </Label>
                                <Input
                                    id="passport_number"
                                    name="passport_number"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.passport_number || ''}
                                    onChange={(e) => handleInputChange('passport_number', e.target.value)}
                                    className="h-9 text-sm"
                                    placeholder="ABC123456"
                                />
                            </div>

                            {/* Languages */}
                            <div className="flex-1 min-w-[300px] flex flex-col gap-2">
                                <Label className="text-xs font-medium">
                                    Languages<span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-wrap gap-2 p-2 rounded border border-input bg-background min-h-[36px]">
                                    {LANGUAGES_ENUM_VALUES.map((language) => (
                                        <label
                                            key={language}
                                            className="flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium cursor-pointer select-none border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <Checkbox
                                                checked={selectedLanguages.includes(language)}
                                                onCheckedChange={(checked) => handleLanguageChange(language, !!checked)}
                                                disabled={isLoading}
                                            />
                                            {language}
                                        </label>
                                    ))}
                                </div>
                                {selectedLanguages.length === 0 && (
                                    <span className="text-xs text-red-500">At least one language is required</span>
                                )}
                            </div>
                        </div>

                        {/* Commission Rates - Optional */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium">
                                    Commission Rates (Optional)
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addCommission}
                                    disabled={isLoading}
                                    className="h-8 text-xs"
                                >
                                    + Add Rate
                                </Button>
                            </div>
                            
                            {commissions.length > 0 && (
                                <div className="space-y-2 p-3 rounded border border-input bg-background/50">
                                    {commissions.map((commission, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-3">
                                                <Label className="text-xs font-medium">Rate (€/hour)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={commission.rate || ''}
                                                    onChange={(e) => updateCommission(index, 'rate', parseInt(e.target.value) || 0)}
                                                    disabled={isLoading}
                                                    className="h-8 text-sm"
                                                    placeholder="25"
                                                />
                                            </div>
                                            <div className="col-span-8">
                                                <Label className="text-xs font-medium">Description</Label>
                                                <Input
                                                    type="text"
                                                    value={commission.description}
                                                    onChange={(e) => updateCommission(index, 'description', e.target.value)}
                                                    disabled={isLoading}
                                                    className="h-8 text-sm"
                                                    placeholder="e.g., Beginner lessons, Advanced course..."
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeCommission(index)}
                                                    disabled={isLoading}
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                                        💡 Commission rates help track teacher earnings per lesson hour. Only rates greater than 0 will be saved.
                                    </div>
                                </div>
                            )}
                            
                            {commissions.length === 0 && (
                                <div className="text-xs text-muted-foreground p-3 rounded border border-dashed border-input">
                                    No commission rates added. You can add rates now or later from the teacher details page.
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-border/50">
                            <Button
                                type="submit"
                                disabled={isLoading || !isFormValid()}
                                className="h-9 px-6 bg-green-500 hover:bg-green-600 text-white"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </span>
                                ) : (
                                    '+ Create Teacher'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}