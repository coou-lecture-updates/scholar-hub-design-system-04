
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export type GatewayBase = {
  id?: string;
  provider: "Flutterwave" | "Korapay" | "Paystack";
  enabled: boolean;
  mode: "test" | "live";
  public_key: string;
  secret_key: string;
  encryption_key?: string;
  merchant_id?: string;
  business_name?: string;
  webhook_url: string;
};

type PaymentGatewayCardProps = {
  g: GatewayBase;
  idx: number;
  providerIcons: Record<string, string>;
  providerDocs: Record<string, string>;
  onChange: (idx: number, key: keyof GatewayBase, value: any) => void;
  onSave: (idx: number) => void;
  onTest: (idx: number) => void;
  saving: boolean;
  testing: boolean;
};

const PaymentGatewayCard: React.FC<PaymentGatewayCardProps> = ({
  g,
  idx,
  providerIcons,
  providerDocs,
  onChange,
  onSave,
  onTest,
  saving,
  testing,
}) => {
  return (
    <Card
      key={g.provider}
      className={`
        shadow-md border-2 border-blue-100 relative transition-all
        hover:scale-[1.011]
        ${!g.enabled ? "opacity-60 grayscale" : ""}
        w-full max-w-md mx-auto
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-row items-center gap-3 w-full">
          {/* Icon and info left */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={providerIcons[g.provider] || ""}
              alt={g.provider + " logo"}
              className="h-8 w-8 rounded bg-white border"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">{g.provider}</CardTitle>
              <CardDescription className="truncate">
                <a
                  href={providerDocs[g.provider]}
                  className="text-xs text-blue-700 hover:underline"
                  target="_blank" rel="noopener noreferrer"
                >API Docs</a>
              </CardDescription>
            </div>
          </div>
          {/* Switch/Badge block RIGHT, very compact and adapted for all screens (never overflow) */}
          <div className="flex flex-col items-center ml-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={g.enabled}
                onCheckedChange={v => onChange(idx, "enabled", v)}
                aria-label="Enable gateway"
                className="scale-100"
                id={`switch-${g.provider}`}
              />
              <Label
                htmlFor={`switch-${g.provider}`}
                className={`text-xs font-medium ml-1 truncate max-w-[62px] text-blue-900`}
              >
                {g.enabled ? "Enabled" : "Disabled"}
              </Label>
            </div>
            <Badge
              variant={g.enabled ? "default" : "outline"}
              className="text-xs px-2 py-0.5 mt-1"
            >
              {g.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
        {/* Test/Live mode toggle: horizontal always */}
        <div className="flex space-x-2 mt-2 w-full">
          <Button
            size="sm"
            variant={g.mode === "test" ? "default" : "outline"}
            className="w-full"
            onClick={() => onChange(idx, "mode", "test")}
            type="button"
            tabIndex={0}
          >Test</Button>
          <Button
            size="sm"
            variant={g.mode === "live" ? "default" : "outline"}
            className="w-full"
            onClick={() => onChange(idx, "mode", "live")}
            type="button"
            tabIndex={0}
          >Live</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 md:space-y-4 px-2 py-3">
        <div className="grid gap-2">
          <Label className="text-xs">Public Key</Label>
          <Input
            type="text"
            value={g.public_key}
            disabled={!g.enabled}
            autoComplete="off"
            onChange={e => onChange(idx, "public_key", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Secret Key</Label>
          <Input
            type="password"
            value={g.secret_key}
            disabled={!g.enabled}
            autoComplete="off"
            onChange={e => onChange(idx, "secret_key", e.target.value)}
          />
        </div>
        {g.provider === "Flutterwave" && (
          <div className="grid gap-2">
            <Label className="text-xs">Encryption Key</Label>
            <Input
              type="password"
              value={g.encryption_key || ""}
              disabled={!g.enabled}
              autoComplete="off"
              onChange={e => onChange(idx, "encryption_key", e.target.value)}
            />
          </div>
        )}
        {g.provider === "Korapay" && (
          <div className="grid gap-2">
            <Label className="text-xs">Merchant ID</Label>
            <Input
              type="text"
              value={g.merchant_id || ""}
              disabled={!g.enabled}
              autoComplete="off"
              onChange={e => onChange(idx, "merchant_id", e.target.value)}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label className="text-xs">Business Name</Label>
          <Input
            type="text"
            value={g.business_name || ""}
            disabled={!g.enabled}
            autoComplete="off"
            onChange={e => onChange(idx, "business_name", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label className="text-xs">Webhook URL</Label>
          <Input
            type="text"
            value={g.webhook_url}
            disabled={!g.enabled}
            autoComplete="off"
            onChange={e => onChange(idx, "webhook_url", e.target.value)}
            placeholder="https://yourdomain.com/webhook"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 pt-3">
          <Button
            size="sm"
            variant="default"
            disabled={!g.enabled || saving}
            className="flex-1"
            onClick={() => onSave(idx)}
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!g.enabled || testing}
            className="flex-1"
            onClick={() => onTest(idx)}
            type="button"
          >
            {testing ? "Testing..." : "Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentGatewayCard;
