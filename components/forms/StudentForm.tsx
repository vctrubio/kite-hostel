"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LANGUAGES_ENUM_VALUES } from "@/lib/constants";
import { HelmetIcon } from "@/svgs/HelmetIcon";
import ReactCountryFlag from "react-country-flag";
import { getData } from "country-list";
import { createStudent } from "@/actions/student-actions";

interface StudentFormData {
  name: string;
  last_name: string;
  languages: string[];
  passport_number: string;
  country: string;
  phone: string;
  size: string;
  desc: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'tel';
  required?: boolean;
  placeholder?: string;
  value: string;
  disabled: boolean;
  className?: string;
  onChange: (value: string) => void;
}


const FormField = ({ id, label, type = 'text', required, placeholder, value, disabled, className = 'flex-1 min-w-[150px]', onChange }: FormFieldProps) => (
    <div className={`${className} flex flex-col gap-2`}>
        <Label htmlFor={id} className="text-xs font-medium">
            {label}{required && <span className="text-red-500">*</span>}
        </Label>
        <Input
            id={id}
            name={id}
            type={type}
            required={required}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 text-sm"
            placeholder={placeholder || label}
        />
    </div>
);

const initialFormData: StudentFormData = {
    name: '',
    last_name: '',
    passport_number: '',
    phone: '',
    country: 'Spain',
    size: '',
    desc: '',
    languages: [],
};

export function StudentForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedCountryCode, setSelectedCountryCode] = useState('ES');
    const [formData, setFormData] = useState<StudentFormData>(initialFormData);
    
    // Get country data
    const countries = getData();

    const resetForm = () => {
        setFormData(initialFormData);
        setSelectedLanguages([]);
        setSelectedCountryCode('ES');
        setError(null);
    };

    const isFormValid = formData.name.trim() && selectedLanguages.length > 0;

    const handleLanguageChange = (language: string, checked: boolean) => {
        setSelectedLanguages(prev => 
            checked ? [...prev, language] : prev.filter(lang => lang !== language)
        );
    };

    const handleInputChange = (key: keyof StudentFormData, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
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
                ...formData,
                last_name: formData.last_name || null,
                passport_number: formData.passport_number || null,
                country: formData.country || null,
                phone: formData.phone || null,
                size: formData.size || null,
                desc: formData.desc || null,
                languages: selectedLanguages as any,
            };

            console.log('Student data being submitted:', data);

            const result = await createStudent(data);
            if (!result.success) {
                throw new Error(result.error || 'Failed to create student');
            }

            toast.success(`Student "${data.name}" created successfully!`, {
                description: `Student ID: ${result.data?.id}`,
                duration: 4000,
            });
            resetForm();
            onSubmit?.(result.data);

        } catch (err: any) {
            console.error('Error creating student:', err);
            const errorMessage = err.message || "Failed to create student";
            setError(errorMessage);
            toast.error("Error Creating Student", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="w-full p-6">
            <Card className="w-full border-border/50 shadow-lg">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                            <HelmetIcon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">Create Student</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* First Row: Name, Last Name, Country, Phone, Passport, Size, Languages */}
                        <div className="flex flex-wrap gap-4">
                            <FormField
                                id="name"
                                label="First Name"
                                required
                                value={formData.name}
                                disabled={isLoading}
                                placeholder="First name"
                                onChange={(value) => handleInputChange('name', value)}
                            />
                            <FormField
                                id="last_name"
                                label="Last Name"
                                value={formData.last_name}
                                disabled={isLoading}
                                placeholder="Last name"
                                onChange={(value) => handleInputChange('last_name', value)}
                            />

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

                            <FormField
                                id="phone"
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                disabled={isLoading}
                                className="w-32"
                                onChange={(value) => handleInputChange('phone', value)}
                            />
                            <FormField
                                id="passport_number"
                                label="Passport Number"
                                value={formData.passport_number}
                                disabled={isLoading}
                                placeholder="ABC123456"
                                className="w-36"
                                onChange={(value) => handleInputChange('passport_number', value)}
                            />
                            <FormField
                                id="size"
                                label="Size"
                                value={formData.size}
                                disabled={isLoading}
                                placeholder="XL"
                                className="w-16"
                                onChange={(value) => handleInputChange('size', value)}
                            />

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

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="desc" className="text-xs font-medium">Description</Label>
                            <textarea
                                id="desc"
                                value={formData.desc}
                                onChange={(e) => handleInputChange('desc', e.target.value)}
                                placeholder="Enter additional notes or description"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-4 border-t border-border/50">
                            <Button
                                type="submit"
                                disabled={isLoading || !isFormValid}
                                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </span>
                                ) : (
                                    '+ Create Student'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}