import React from "react";

export function UserWallet() {
  // Placeholder for user info, replace with real user data as needed
  const user = {
    name: "John Doe",
    email: "john@example.com",
    balance: 100,
  };

  return (
    <div className="p-4 rounded border flex flex-col gap-1">
      <div className="font-bold">Who am I?</div>
      <div>Name: {user.name}</div>
      <div>Email: {user.email}</div>
      <div>Wallet Balance: ${user.balance}</div>
    </div>
  );
}
