import { BookmarkIcon } from "@/svgs";
import { Duration } from "@/components/formatters/Duration";

interface PackageDetailsProps {
  packageData: any;
  eventHours: number;
  pricePerHourPerStudent: number;
  totalPrice: number;
  priceToPay: number;
  referenceId?: string;
}

export function PackageDetails({ 
  packageData, 
  eventHours, 
  pricePerHourPerStudent, 
  totalPrice, 
  priceToPay,
  referenceId
}: PackageDetailsProps) {
  if (!packageData) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <BookmarkIcon className="w-5 h-5 text-indigo-500" />
        <span>Package Details</span>
      </h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Description:</span>
          <p className="font-medium">
            {packageData.description || "No description"}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Reference:</span>
          <p className="font-medium">
            {referenceId || "NULL"}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Duration:</span>
          <p className="font-medium">
            <Duration minutes={packageData.duration} />
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Used Hours:</span>
          <p className="font-medium">
            <Duration minutes={eventHours * 60} />
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Kite Capacity:</span>
          <p className="font-medium">
            {packageData.capacity_kites} kites / {packageData.capacity_students} students
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">
            Price per Student:
          </span>
          <p className="font-medium">
            €{packageData.price_per_student}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">
            Price per Hour/Student:
          </span>
          <p className="font-medium">
            €{pricePerHourPerStudent.toFixed(2)}/h
          </p>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Total Price:</span>
          <p className="font-medium text-green-600">€{totalPrice}</p>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Price to Pay/Student:</span>
          <p className="font-medium text-blue-600">€{priceToPay.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
