import React from "react";
import { UserOutlined } from "@ant-design/icons";
import Card from "../../common/display/Card";
import type { UserWithRoles } from "../../../types/user.types";

export interface AdministratorCardProps {
  administrator: UserWithRoles;
  onClick: (administrator: UserWithRoles) => void;
  canManage: boolean;
}

const AdministratorCard: React.FC<AdministratorCardProps> = ({
  administrator,
  onClick,
}) => {
  const handleCardClick = () => {
    onClick(administrator);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="shadow-md rounded-xl transition-all border border-gray-100"
      bordered={true}
    >
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-400">
          <UserOutlined />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-gray-800">{administrator.email || "-"}</span>
          </div>
          <div className="text-gray-700 font-medium">
            {administrator.fullName || "Unknown Name"}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdministratorCard;