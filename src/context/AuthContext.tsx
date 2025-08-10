'use client';

import { useContext } from "react";
import { createContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getAuthClient, getDbClient } from "@/helpers/firebase/firebase";

type UserRole = "individual" | "organization" | "ngo";

export type UserData = {
  uid: string;
  email: string;
  name?: string;
  role?: UserRole;
};

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthClient();
    const db = getDbClient();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          return;
        }

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data() as Partial<UserData> & { role?: string; name?: string };
          
          // ✅ Normalize role to lowercase if it matches expected values
          const rawRole = typeof data.role === "string" ? data.role.toLowerCase() : undefined;
          const normalizedRole: UserRole | undefined =
            rawRole === "individual" || rawRole === "organization" || rawRole === "ngo"
              ? rawRole
              : undefined;

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            name: typeof data.name === "string" ? data.name : undefined,
            role: normalizedRole,
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? "",
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const auth = getAuthClient();
    await signOut(auth);
    setUser(null);
    router.push("/landing"); // ✅ redirect after logout
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
