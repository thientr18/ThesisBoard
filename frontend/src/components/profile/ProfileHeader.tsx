import React from 'react';
import type { UserWithRoles } from '../../types/user.types';
import Avatar from '../common/display/Avatar';
import Tag from '../common/display/Tag';

interface ProfileHeaderProps {
  user: UserWithRoles;
}

const roleTagType: Record<string, 'error' | 'info' | 'success' | 'default'> = {
  admin: 'error',
  moderator: 'info',
  teacher: 'success',
  student: 'default',
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const fullName = user.fullName || 'Unnamed User';
  
  const roleItems = (user.roles ?? []) as Array<{ name: string } | string>;
  const roleNames = roleItems.map((r) => (typeof r === 'string' ? r : r.name));

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Avatar name={fullName} className="h-16 w-16 border" size={64} />
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{fullName}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {roleNames.map((role) => (
            <Tag key={role} type={roleTagType[role]} label={role} />
          ))}
          {!user.status && <Tag type="error" label="Inactive" />}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;