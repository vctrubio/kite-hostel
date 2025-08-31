"use server";

import db from "@/drizzle";
import { user_wallet } from "@/drizzle/migrations/schema";
import { InferInsertModel, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { toUTCString } from '@/components/formatters/TimeZone';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const formatUserWallet = (wallet: any) => ({
  id: wallet.id,
  role: wallet.role,
  sk: wallet.sk,
  pk: wallet.pk,
  note: wallet.note,
  teacher_name: wallet.teacher?.name || null,
  sk_email: wallet.user?.email || null,
  sk_full_name: wallet.user?.user_metadata?.full_name || null,
});

export async function getUserWallets() {
  try {
    const userWallets = await db.query.user_wallet.findMany({
      with: {
        teacher: {
          columns: {
            name: true,
          },
        },
      },
    });

    const supabaseAdmin = createAdminClient();
    const {
      data: { users: allAuthUsers },
      error: authError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching all auth users:", authError);
      return { data: [], error: authError.message };
    }

    const authUsersMap = new Map(allAuthUsers.map((user) => [user.id, user]));

    const formattedUserWallets = userWallets.map((wallet) => {
      const authUser = wallet.sk ? authUsersMap.get(wallet.sk) : undefined;
      return {
        ...formatUserWallet(wallet),
        sk_email: authUser?.email || null,
        sk_full_name: authUser?.user_metadata?.full_name || null,
      };
    });

    return { data: formattedUserWallets, error: null };
  } catch (error: any) {
    console.error("Error fetching user wallets with Drizzle:", error);
    return { data: [], error: error.message };
  }
}

export async function getUserWalletById(id: string) {
  try {
    const userWallet = await db.query.user_wallet.findFirst({
      where: eq(user_wallet.id, id),
      with: {
        teacher: {
          columns: {
            name: true,
          },
        },
      },
    });

    if (!userWallet) {
      return { data: null, error: "User wallet not found." };
    }

    let sk_email = null;
    let sk_full_name = null;

    if (userWallet.sk) {
      const supabaseAdmin = createAdminClient();
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.getUserById(userWallet.sk);

      if (authError) {
        console.error("Error fetching auth user by ID:", authError);
      } else if (authUser) {
        sk_email = authUser.user?.email || null;
        sk_full_name = authUser.user?.user_metadata?.full_name || null;
      }
    }

    const formattedUserWallet = {
      ...formatUserWallet(userWallet),
      sk_email,
      sk_full_name,
    };

    return { data: formattedUserWallet, error: null };
  } catch (error: any) {
    console.error("Error fetching user wallet by ID:", error);
    return { data: null, error: error.message };
  }
}

type UserWalletUpdate = Partial<InferInsertModel<typeof user_wallet>>;

export async function updateUserWallet(id: string, data: UserWalletUpdate) {
  try {
    const updatedWallet = await db
      .update(user_wallet)
      .set({ ...data, updated_at: toUTCString(new Date()) })
      .where(eq(user_wallet.id, id))
      .returning();

    if (updatedWallet.length === 0) {
      return { success: false, error: "User wallet not found." };
    }

    revalidatePath("/users");
    revalidatePath("/users/" + id);

    // Re-fetch the updated wallet with relations to ensure full data is returned
    const { data: reFetchedWallet, error: reFetchError } =
      await getUserWalletById(id);

    if (reFetchError || !reFetchedWallet) {
      console.error(
        "Error re-fetching user wallet after update:",
        reFetchError,
      );
      return {
        success: false,
        error: reFetchError || "Failed to re-fetch updated wallet.",
      };
    }

    return { success: true, wallet: reFetchedWallet };
  } catch (error: any) {
    console.error("Error updating user wallet:", error);
    return { success: false, error: error.message };
  }
}

type UserWalletInsert = InferInsertModel<typeof user_wallet>;

export async function createUserWallet(data: UserWalletInsert) {
  try {
    if (data.pk) {
      const existingWalletWithPk = await db.query.user_wallet.findFirst({
        where: eq(user_wallet.pk, data.pk),
      });
      if (existingWalletWithPk) {
        return {
          success: false,
          error: "PK (Teacher) is already assigned to another user wallet.",
        };
      }
    }

    if (data.sk) {
      const existingWalletWithSk = await db.query.user_wallet.findFirst({
        where: eq(user_wallet.sk, data.sk),
      });
      if (existingWalletWithSk) {
        return {
          success: false,
          error: "SK (User) is already assigned to another user wallet.",
        };
      }
    }

    const newWallet = await db.insert(user_wallet).values(data).returning();

    if (newWallet.length === 0) {
      return { success: false, error: "Failed to create user wallet." };
    }

    revalidatePath("/users");
    return { success: true, wallet: newWallet[0] };
  } catch (error: any) {
    console.error("Error creating user wallet:", error);
    return { success: false, error: error.message };
  }
}

export async function getAvailableSk() {
  try {
    const supabaseAdmin = createAdminClient();
    const {
      data: { users: allAuthUsers },
      error: authError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching all auth users:", authError);
      return { data: [], error: authError.message };
    }

    const assignedSks = await db.query.user_wallet.findMany({
      columns: {
        sk: true,
      },
      where: (user_wallet, { isNotNull }) => isNotNull(user_wallet.sk),
    });

    const assignedSkIds = assignedSks.map((wallet) => wallet.sk);

    const availableAuthUsers = allAuthUsers
      .filter((user) => !assignedSkIds.includes(user.id))
      .map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
      }));

    return { data: availableAuthUsers, error: null };
  } catch (error: any) {
    console.error("Error fetching available SKs:", error);
    return { data: [], error: error.message };
  }
}

export async function getAvailablePks() {
  try {
    const allTeachers = await db.query.Teacher.findMany();

    const assignedPks = await db.query.user_wallet.findMany({
      columns: {
        pk: true,
      },
      where: (user_wallet, { isNotNull }) => isNotNull(user_wallet.pk),
    });

    const assignedPkIds = assignedPks.map((wallet) => wallet.pk);

    const availableTeachers = allTeachers.filter(
      (teacher) => !assignedPkIds.includes(teacher.id),
    );

    return { data: availableTeachers, error: null };
  } catch (error: any) {
    console.error("Error fetching available PKs:", error);
    return { data: [], error: error.message };
  }
}

import { getTeacherById, type TeacherWithRelations } from "./teacher-actions";

export async function getCurrentUserWallet(): Promise<{
  pk: string | null;
  role: string;
  teacher: TeacherWithRelations | null;
}> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { pk: null, role: "guest", teacher: null };
  }

  try {
    const wallet = await db.query.user_wallet.findFirst({
      where: eq(user_wallet.sk, user.id),
    });

    if (!wallet) {
      return { pk: null, role: "guest", teacher: null };
    }

    let teacherData: TeacherWithRelations | null = null;
    const userRole = wallet.role || "guest";

    if (
      wallet.pk &&
      (userRole === "teacher" || userRole === "teacherAdmin")
    ) {
      const { data } = await getTeacherById(wallet.pk);
      teacherData = data;
    }

    return {
      pk: wallet.pk,
      role: userRole,
      teacher: teacherData,
    };
  } catch (error) {
    console.error("Error fetching user wallet with Drizzle:", error);
    return { pk: null, role: "guest", teacher: null };
  }
}