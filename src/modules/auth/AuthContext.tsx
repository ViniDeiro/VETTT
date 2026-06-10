import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Role, AppModuleKey, ModulePermission, AccessProfile, TeamMember } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: AccessProfile | null;
  teamMember: TeamMember | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; needsEmailConfirmation?: boolean; message?: string }>;
  logout: () => Promise<void>;
  canAccess: (moduleKey: AppModuleKey, action?: keyof ModulePermission) => boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  clinicName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfile = (row: any): AccessProfile | null => {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    type: row.type || 'custom',
    baseRole: row.base_role,
    permissions: row.permissions || {},
    restrictions: row.restrictions || {
      editAgenda: false,
      cancelAttendance: false,
      viewValues: false,
      sensitiveSettings: false
    }
  };
};

const mapTeamMember = (row: any): TeamMember | null => {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    functionTitle: row.function_title,
    specialty: row.specialty,
    crmv: row.crmv,
    cpf: row.cpf,
    phone: row.phone || '',
    email: row.email,
    signature: row.signature,
    photo: row.photo_url,
    status: row.status || 'active',
    createdAt: row.created_at
  };
};

const mapUser = (row: any): User | null => {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name || row.name,
    role: row.role,
    email: row.email,
    phone: row.phone,
    functionTitle: row.function_title,
    accessProfileId: row.access_profile_id,
    status: row.status || 'active',
    createdAt: row.created_at,
    lastAccessAt: row.last_access_at,
    teamMemberId: row.team_member_id
  };
};

const syncMockCurrentUser = (user: User | null) => {
  if (!user) {
    mockDB.logout();
    return;
  }

  mockDB.syncAuthenticatedUser(user);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserContext = async (authUserId: string, attempts = 3) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const { data: profileRow, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (!error && profileRow) {
        const [accessProfileResult, teamMemberResult] = await Promise.all([
          profileRow.access_profile_id
            ? supabase.from('access_profiles').select('*').eq('id', profileRow.access_profile_id).maybeSingle()
            : Promise.resolve({ data: null } as any),
          profileRow.team_member_id
            ? supabase.from('team_members').select('*').eq('id', profileRow.team_member_id).maybeSingle()
            : Promise.resolve({ data: null } as any)
        ]);

        const mappedUser = mapUser(profileRow);
        const mappedProfile = mapProfile(accessProfileResult.data) || mockDB.getProfileById(
          mappedUser?.role === 'admin' ? 'profile-admin' : mappedUser?.role === 'vet' ? 'profile-vet' : 'profile-secretary'
        );
        const mappedTeamMember = mapTeamMember(teamMemberResult.data);

        setUser(mappedUser);
        setProfile(mappedProfile);
        setTeamMember(mappedTeamMember);
        syncMockCurrentUser(mappedUser);
        return mappedUser;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setUser(null);
    setProfile(null);
    setTeamMember(null);
    syncMockCurrentUser(null);
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        await loadUserContext(data.session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setTeamMember(null);
        syncMockCurrentUser(null);
      }
      if (mounted) setIsLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        loadUserContext(session.user.id).finally(() => mounted && setIsLoading(false));
      } else {
        setUser(null);
        setProfile(null);
        setTeamMember(null);
        syncMockCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || ''
    });

    if (error || !data.user) return false;

    const loadedUser = await loadUserContext(data.user.id);
    if (loadedUser?.status === 'inactive') {
      await logout();
      return false;
    }

    await supabase.rpc('touch_login');
    return Boolean(loadedUser);
  };

  const register = async ({ name, email, password, role, clinicName, phone }: RegisterPayload) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name,
          role,
          clinic_name: clinicName || `${name} - Clinica`,
          phone
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.session?.user) {
      await loadUserContext(data.session.user.id, 6);
      return { success: true };
    }

    return {
      success: true,
      needsEmailConfirmation: true,
      message: 'Cadastro criado. Confirme seu e-mail antes de entrar.'
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    syncMockCurrentUser(null);
    setUser(null);
    setProfile(null);
    setTeamMember(null);
  };

  const canAccess = (moduleKey: AppModuleKey, action: keyof ModulePermission = 'view') => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const permission = profile?.permissions?.[moduleKey];
    if (!permission) return mockDB.canUserAccess(user, moduleKey, action);
    return Boolean(permission[action] ?? permission.view);
  };

  return (
    <AuthContext.Provider value={{ user, profile, teamMember, isLoading, login, register, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
