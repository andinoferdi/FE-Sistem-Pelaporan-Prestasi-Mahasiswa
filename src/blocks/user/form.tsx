"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { User, Role, Lecturer } from "@/types/user";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLecturers } from "@/services/user";

const createUserSchema = (roles: Role[] = []) => z.object({
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  role_id: z.string().min(1, "Role wajib dipilih"),
  is_active: z.boolean().optional(),
  student_id: z.string().optional(),
  program_study: z.string().optional(),
  academic_year: z.string().optional(),
  advisor_id: z.string().optional(),
  lecturer_id: z.string().optional(),
  department: z.string().optional(),
}).superRefine((data, ctx) => {
  const selectedRole = roles.find(r => r.id === data.role_id);
  const roleName = selectedRole?.name.toLowerCase() ?? "";
  
  if (roleName === "mahasiswa") {
    if (!data.student_id || data.student_id.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Student ID wajib diisi",
        path: ["student_id"],
      });
    }
  }
  
  if (roleName === "dosen wali") {
    if (!data.lecturer_id || data.lecturer_id.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Lecturer ID wajib diisi",
        path: ["lecturer_id"],
      });
    }
  }
});

const editUserSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  password: z.string().optional().refine(
    (val) => !val || val.length === 0 || val.length >= 6,
    { message: "Password minimal 6 karakter" }
  ),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  role_id: z.string().min(1, "Role wajib dipilih"),
  is_active: z.boolean().optional(),
});

type CreateUserFormValues = {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role_id: string;
  is_active?: boolean;
  student_id?: string;
  program_study?: string;
  academic_year?: string;
  advisor_id?: string;
  lecturer_id?: string;
  department?: string;
};

type EditUserFormValues = z.infer<typeof editUserSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

export interface UserFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<User>;
  roles?: Role[];
  onSubmit?: (values: UserFormValues) => Promise<void> | void;
  submitting?: boolean;
}

export function UserForm({
  mode = "create",
  initialValues,
  roles = [],
  onSubmit,
  submitting: externalSubmitting,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isCreate = mode === "create";
  const userSchema = isCreate ? createUserSchema(roles) : editUserSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: initialValues?.username ?? "",
      email: initialValues?.email ?? "",
      password: "",
      full_name: initialValues?.full_name ?? "",
      role_id: initialValues?.role_id ?? "",
      is_active: initialValues?.is_active ?? true,
      student_id: "",
      program_study: "",
      academic_year: "",
      advisor_id: "",
      lecturer_id: "",
      department: "",
    },
  });

  const selectedRoleId = useWatch({
    control: form.control,
    name: "role_id",
  });
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  const roleName = selectedRole?.name.toLowerCase() ?? "";

  const { data: lecturers = [] } = useQuery<Lecturer[]>({
    queryKey: ["lecturers"],
    queryFn: getLecturers,
    enabled: isCreate,
  });

  useEffect(() => {
    if (isCreate && selectedRoleId) {
      if (roleName !== "mahasiswa") {
        form.setValue("student_id", "");
        form.setValue("program_study", "");
        form.setValue("academic_year", "");
        form.setValue("advisor_id", "");
      }
      if (roleName !== "dosen wali") {
        form.setValue("lecturer_id", "");
        form.setValue("department", "");
      }
    }
  }, [selectedRoleId, roleName, isCreate, form]);

  useEffect(() => {
    if (initialValues) {
      form.reset({
        username: initialValues.username ?? "",
        email: initialValues.email ?? "",
        password: "",
        full_name: initialValues.full_name ?? "",
        role_id: initialValues.role_id ?? "",
        is_active: initialValues.is_active ?? true,
        student_id: "",
        program_study: "",
        academic_year: "",
        advisor_id: "",
        lecturer_id: "",
        department: "",
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: UserFormValues) => {
    if (!onSubmit) {
      console.warn("UserForm di-submit, tapi tidak ada onSubmit prop.");
      return;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      console.error(err);
    }
  };

  const submitting = externalSubmitting ?? form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Masukkan username"
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Masukkan email"
                    disabled={submitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password {!isCreate && "(kosongkan jika tidak ingin mengubah)"}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isCreate
                        ? "Masukkan password"
                        : "Kosongkan jika tidak ingin mengubah"
                    }
                    disabled={submitting}
                    value={field.value ?? ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={submitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormDescription>
                {isCreate
                  ? "Password minimal 6 karakter"
                  : "Kosongkan jika tidak ingin mengubah password"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Masukkan nama lengkap"
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={submitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCreate && roleName === "mahasiswa" && (
          <>
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan student ID"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="program_study"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Studi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan program studi"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Akademik</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan tahun akademik"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="advisor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosen Pembimbing</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? "" : value);
                    }}
                    value={field.value || "none"}
                    disabled={submitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih dosen pembimbing (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak Ada Dosen Pembimbing</SelectItem>
                      {lecturers.map((lecturer) => (
                        <SelectItem key={lecturer.id} value={lecturer.id}>
                          {lecturer.lecturer_id} - {lecturer.full_name || ""} - {lecturer.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isCreate && roleName === "dosen wali" && (
          <>
            <FormField
              control={form.control}
              name="lecturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lecturer ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan lecturer ID"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan departemen"
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {!isCreate && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={submitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Status Aktif</FormLabel>
                  <FormDescription>
                    Centang untuk mengaktifkan user, uncentang untuk menonaktifkan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Menyimpan..."
              : isCreate
              ? "Simpan User"
              : "Perbarui User"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
