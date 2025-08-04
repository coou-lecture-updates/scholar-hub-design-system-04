
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key } from 'lucide-react';

interface SettingField {
  id: string;
  key: string;
  value: any;
  description?: string;
  is_encrypted?: boolean;
  input: React.ReactNode;
}

interface SettingsGroupPanelProps {
  icon: React.ElementType;
  title: React.ReactNode;
  description?: React.ReactNode;
  settingFields: SettingField[];
}

const SettingsGroupPanel: React.FC<SettingsGroupPanelProps> = ({
  icon: Icon,
  title,
  description,
  settingFields,
}) => (
  <Card className="shadow-md border-blue-100 bg-white overflow-hidden transition">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-6">
        {settingFields.map(field => (
          <div
            key={field.id}
            className="space-y-2 rounded-lg border border-gray-100 p-3 bg-blue-50/40 hover:bg-blue-100/40 transition"
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <Label className="truncate text-sm font-semibold text-blue-900" htmlFor={field.key}>
                {field.key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </Label>
              {field.is_encrypted && (
                <Badge variant="outline" className="text-xs ml-1 shrink-0 flex items-center">
                  <Key className="h-3 w-3 mr-1" />
                  Encrypted
                </Badge>
              )}
            </div>
            {field.description && (
              <p className="text-xs text-gray-500 italic mb-1 truncate">{field.description}</p>
            )}
            {field.input}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SettingsGroupPanel;
