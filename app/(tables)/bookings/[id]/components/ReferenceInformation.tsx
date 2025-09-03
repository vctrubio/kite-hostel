interface ReferenceInformationProps {
  reference: {
    id: string;
    teacher?: {
      name: string;
    } | null;
    note?: string;
  } | null;
}

export function ReferenceInformation({ reference }: ReferenceInformationProps) {
  if (!reference) return null;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h2 className="text-xl font-semibold">Reference Information</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Reference ID:</span>
          <p className="font-medium">{reference.id}</p>
        </div>
        {reference.teacher && (
          <div>
            <span className="text-muted-foreground">Teacher:</span>
            <p className="font-medium">
              {reference.teacher.name}
            </p>
          </div>
        )}
        {reference.note && (
          <div className="col-span-2">
            <span className="text-muted-foreground">Note:</span>
            <p className="font-medium">{reference.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
