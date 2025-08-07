import { type InferSelectModel } from "drizzle-orm";
import { PackageStudent } from "@/drizzle/migrations/schema";

export type PackageStudent = InferSelectModel<typeof PackageStudent>;