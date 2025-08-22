import { getAvailablePks, getAvailableSk } from "@/actions/user-actions";
import { CreateUserWalletForm } from "@/components/forms/CreateUserWalletForm";

export default async function CreateReferencePage() {
  const [pksResult, sksResult] = await Promise.all([
    getAvailablePks(),
    getAvailableSk(),
  ]);

  if (pksResult.error || sksResult.error) {
    const errorMessage = pksResult.error || sksResult.error;
    return <div className="container mx-auto p-4">Error loading form data: {errorMessage}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <CreateUserWalletForm
        availablePks={pksResult.data || []}
        availableSks={sksResult.data || []}
      />
    </div>
  );
}
