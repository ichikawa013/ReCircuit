'use client';
import { useContext } from "react";
import { createContext, useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
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
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
          const normalizedRole =
            data.role === "individual" || data.role === "organization" || data.role === "ngo"
              ? data.role
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

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;

  
}

export function useAuth(): AuthContextType {
return useContext(AuthContext);
}