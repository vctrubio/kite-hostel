import { Duration } from "@/components/formatters/Duration";

interface PackageDetailsProps {
  packageData: any;
  eventHours?: number;
  pricePerHourPerStudent?: number;
  totalPrice?: number;
  priceToPay?: number;
  referenceId?: string;
  variant?: "full" | "simple";
}

export function PackageDetails({ 
  packageData,
  eventHours = 0,
  pricePerHourPerStudent = 0,
  totalPrice = 0,
  priceToPay = 0,
  referenceId,
  variant = "simple"
}: PackageDetailsProps) {
  if (!packageData) return null;

  if (variant === "simple") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Description:</span>
          <p className="font-medium">
            {packageData.description || "No description"}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Duration:</span>
          <p className="font-medium">
            <Duration minutes={packageData.duration || 0} />
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Price per Student:</span>
          <p className="font-medium">
            €{packageData.price_per_student}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Price per Hour/Student:</span>
          <p className="font-medium">
            €{packageData.duration
              ? Math.round(
                (packageData.price_per_student /
                  (packageData.duration / 60)) *
                100,
              ) / 100
              : 0}/h
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Capacity:</span>
          <p className="font-medium">
            {packageData.capacity_kites} kites / {packageData.capacity_students} students
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Expected Total:</span>
          <p className="font-medium text-green-600">
            €{totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  // Full variant - Expected vs Actual side by side
  return (
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
          Price per Hour/Student:
        </span>
        <p className="font-medium">
          €{pricePerHourPerStudent.toFixed(2)}/h
        </p>
      </div>
      
      {/* Expected vs Actual - Side by side */}
      <div>
        <span className="text-muted-foreground">Expected Price per Student:</span>
        <p className="font-medium text-green-600">
          €{packageData.price_per_student}
        </p>
      </div>
      <div>
        <span className="text-muted-foreground">Actual Price per Student:</span>
        <p className="font-medium text-blue-600">
          €{priceToPay.toFixed(2)}
        </p>
      </div>
      <div>
        <span className="text-muted-foreground">Package Price:</span>
        <p className="font-medium text-green-600">€{totalPrice}</p>
      </div>
      <div>
        <span className="text-muted-foreground">Expected Total:</span>
        <p className="font-medium text-blue-600">€{(priceToPay * (packageData.capacity_students || 1)).toFixed(2)}</p>
      </div>
    </div>
  );
}