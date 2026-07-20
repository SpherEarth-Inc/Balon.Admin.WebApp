"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getMe,
  removeProfilePhoto,
  updateMe,
  uploadProfilePhoto,
} from "@/api/account";
import type { UserProfile } from "@/api/types";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProfilePhotoField } from "@/components/profile/profile-photo-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/context";

export default function ProfilePage() {
  const { email } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMe()
      .then((me) => {
        if (cancelled) return;
        setProfile(me.profile);
        setFirstName(me.profile.first_name ?? "");
        setMiddleName(me.profile.middle_name ?? "");
        setLastName(me.profile.last_name ?? "");
        setDateOfBirth(me.profile.date_of_birth ?? "");
        setPhone(me.profile.phone_number ?? "");
        setJobTitle(me.profile.job_title ?? "");
        setPhotoUrl(me.profile.photo_url ?? "");
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const me = await updateMe({
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth.trim() || null,
        phone_number: phone.trim(),
        job_title: jobTitle.trim(),
      });
      setProfile(me.profile);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <div className="space-y-5">
      <div>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Profile" },
          ]}
        />
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-brand-navy">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details for Terra Admin.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-none border border-border bg-white p-5 shadow-sm sm:p-6"
      >
        <ProfilePhotoField
          label="Profile photo"
          value={photoUrl}
          onUpload={async (file) => {
            try {
              const me = await uploadProfilePhoto(file);
              setProfile(me.profile);
              setPhotoUrl(me.profile.photo_url ?? "");
              toast.success("Photo updated");
              return me.profile.photo_url;
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
              return null;
            }
          }}
          onClear={async () => {
            try {
              const me = await removeProfilePhoto();
              setProfile(me.profile);
              setPhotoUrl("");
              toast.success("Photo removed");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Could not remove photo");
            }
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email ?? ""} disabled readOnly />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="first">First name</Label>
            <Input
              id="first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middle">Middle name</Label>
            <Input
              id="middle"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last">Last name</Label>
            <Input
              id="last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job">Job title</Label>
          <Input
            id="job"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. News Editor"
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
