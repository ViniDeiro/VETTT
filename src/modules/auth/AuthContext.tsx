import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Role, AppModuleKey, ModulePermission, AccessProfile, TeamMember } from '../../domain/types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

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

const getDefaultProfileForRole = (role: string): AccessProfile => {
  const basePermissions = {
    view: false, create: false, edit: false, delete: false, exportPdf: false, accessFinancial: false, accessStock: false
  };

  const createSet = (overrides: Record<string, Partial<ModulePermission>>): any => {
    const modules = [
      'settings', 'users', 'branding', 'finance', 'inventory', 'attendance', 'medicalRecords', 'agenda', 'reports', 'documents', 'invoices', 'whatsapp', 'audit', 'patients', 'team'
    ];
    return modules.reduce((acc, key) => {
      acc[key] = { ...basePermissions, ...(overrides[key] || {}) };
      return acc;
    }, {} as any);
  };

  if (role === 'admin') {
    return {
      id: 'profile-admin',
      name: 'Administrador (ADM)',
      description: 'Acesso total ao sistema.',
      type: 'standard',
      baseRole: 'admin',
      permissions: createSet({
        settings: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        users: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        branding: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        finance: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        inventory: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        attendance: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        medicalRecords: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        agenda: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        reports: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        documents: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        invoices: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        whatsapp: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        audit: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        patients: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true },
        team: { view: true, create: true, edit: true, delete: true, exportPdf: true, accessFinancial: true, accessStock: true }
      }),
      restrictions: { editAgenda: true, cancelAttendance: true, viewValues: true, sensitiveSettings: true }
    };
  }

  if (role === 'vet') {
    return {
      id: 'profile-vet',
      name: 'Medico Veterinario',
      description: 'Permissoes clinicas.',
      type: 'standard',
      baseRole: 'vet',
      permissions: createSet({
        attendance: { view: true, create: true, edit: true, exportPdf: true } as any,
        medicalRecords: { view: true, create: true, edit: true, exportPdf: true } as any,
        agenda: { view: true, create: true, edit: true } as any,
        patients: { view: true, create: true, edit: true } as any,
        documents: { view: true, create: true, edit: true, exportPdf: true } as any,
        inventory: { view: true, accessStock: true } as any,
        finance: { view: true, accessFinancial: true } as any
      }),
      restrictions: { editAgenda: true, cancelAttendance: false, viewValues: true, sensitiveSettings: false }
    };
  }

  return {
    id: 'profile-secretary',
    name: 'Secretaria / Recepcao',
    description: 'Permissoes administrativas restritas.',
    type: 'standard',
    baseRole: 'secretary',
    permissions: createSet({
      agenda: { view: true, create: true, edit: true } as any,
      patients: { view: true, create: true, edit: true } as any,
      attendance: { view: true } as any,
      inventory: { view: true, create: true, edit: true, accessStock: true } as any,
      finance: { view: true, create: true, accessFinancial: true } as any,
      documents: { view: true, exportPdf: true } as any
    }),
    restrictions: { editAgenda: true, cancelAttendance: false, viewValues: true, sensitiveSettings: false }
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccessProfile | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserContext = async (authUserId: string, attempts = 3) => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      setTeamMember(null);
      return null;
    }

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
        const mappedProfile = mapProfile(accessProfileResult.data) || getDefaultProfileForRole(mappedUser?.role || 'secretary');
        const mappedTeamMember = mapTeamMember(teamMemberResult.data);

        setUser(mappedUser);
        setProfile(mappedProfile);
        setTeamMember(mappedTeamMember);
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

    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      setProfile(null);
      setTeamMember(null);
      syncMockCurrentUser(null);
      setIsLoading(false);
      return () => {
        mounted = false;
      };
    }

    const client = supabase;

    const loadSession = async () => {
      const { data } = await client.auth.getSession();
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

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
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
    if (!supabase) return false;

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
    if (!supabase) {
      return {
        success: false,
        message: 'Configuração do Supabase ausente. Verifique as variáveis públicas do ambiente.'
      };
    }

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
    await supabase?.auth.signOut();
    setUser(null);
    setProfile(null);
    setTeamMember(null);
  };

  const canAccess = (moduleKey: AppModuleKey, action: keyof ModulePermission = 'view') => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const permission = profile?.permissions?.[moduleKey];
    if (!permission) {
      if (user.role === 'vet') {
        const vetAllowed = ['attendance', 'medicalRecords', 'agenda', 'patients', 'documents', 'inventory', 'finance'];
        if (vetAllowed.includes(moduleKey)) {
          if (moduleKey === 'inventory') return action === 'view' || action === 'accessStock';
          if (moduleKey === 'finance') return action === 'view' || action === 'accessFinancial';
          return action === 'view' || action === 'create' || action === 'edit' || action === 'exportPdf';
        }
      }
      if (user.role === 'secretary') {
        const secAllowed = ['agenda', 'patients', 'attendance', 'inventory', 'finance', 'documents'];
        if (secAllowed.includes(moduleKey)) {
          if (moduleKey === 'attendance') return action === 'view';
          if (moduleKey === 'documents') return action === 'view' || action === 'exportPdf';
          if (moduleKey === 'inventory') return action === 'view' || action === 'create' || action === 'edit' || action === 'accessStock';
          if (moduleKey === 'finance') return action === 'view' || action === 'create' || action === 'accessFinancial';
          return action === 'view' || action === 'create' || action === 'edit';
        }
      }
      return false;
    }
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
