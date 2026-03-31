import type { Dispatch, SetStateAction } from "react";

import type { OrganizationDto, ProductDto, UserDto } from "@/app/lib/types";

import type { Feedback } from "../types";

export type Translate = (key: string, values?: Record<string, string | number>) => string;

export type StateSetter<T> = Dispatch<SetStateAction<T>>;

export type RunAction = <T>(
  key: string,
  action: () => Promise<T>,
  successMessage?: string,
) => Promise<T | null>;

export type SetFeedback = (key: string, feedback: Feedback | null) => void;

export type RequiredFieldMessage = (fieldKey: string) => string;

export type ReloadWorkspace = () => Promise<void>;

export type RefreshCurrentUser = () => Promise<UserDto | null>;

export type RefreshProductsList = () => Promise<ProductDto[]>;

export type UpsertOrganizationSummary = (
  organization: OrganizationDto,
  leaderId?: number | null,
) => void;
