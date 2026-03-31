import type { FormEvent } from "react";

import { apiRequest } from "@/app/lib/api";
import { saveAuthSession } from "@/app/lib/session";
import type { AuthSession, UserDto } from "@/app/lib/types";

import type { ProfileFormState } from "../types";
import { parseOptionalNumber, parseRequiredNumber, requireText } from "../utils";
import { syncSelectedItem } from "../workspaceHelpers";
import type {
  ReloadWorkspace,
  RequiredFieldMessage,
  RunAction,
  SetFeedback,
  StateSetter,
  Translate,
} from "./shared";

type UserOperationsParams = {
  session: AuthSession | null;
  currentUser: UserDto | null;
  users: UserDto[];
  directoryUsers: UserDto[];
  profileForm: ProfileFormState;
  userLookupId: string;
  deleteUserId: string;
  isAdmin: boolean;
  isLeader: boolean;
  canDeleteUsers: boolean;
  visibleUserIds: Set<number>;
  runAction: RunAction;
  setFeedback: SetFeedback;
  requiredFieldMessage: RequiredFieldMessage;
  setCurrentUser: StateSetter<UserDto | null>;
  setSelectedUser: StateSetter<UserDto | null>;
  setUsers: StateSetter<UserDto[]>;
  setDirectoryUsers: StateSetter<UserDto[]>;
  setProfileForm: StateSetter<ProfileFormState>;
  handleSignOut: () => void;
  refreshWorkspaceSnapshot: ReloadWorkspace;
  t: Translate;
};

export function createUserOperations({
  session,
  currentUser,
  users,
  directoryUsers,
  profileForm,
  userLookupId,
  deleteUserId,
  isAdmin,
  isLeader,
  canDeleteUsers,
  visibleUserIds,
  runAction,
  setFeedback,
  requiredFieldMessage,
  setCurrentUser,
  setSelectedUser,
  setUsers,
  setDirectoryUsers,
  setProfileForm,
  handleSignOut,
  refreshWorkspaceSnapshot,
  t,
}: UserOperationsParams) {
  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session) {
      return;
    }

    const updatedUser = await runAction(
      "profile",
      async () => {
        const payload: UserDto = {
          fullName: requireText(profileForm.fullName, requiredFieldMessage("fields.fullName")),
          email: requireText(profileForm.email, requiredFieldMessage("fields.email")),
          password: profileForm.password || null,
          role: currentUser?.role ?? profileForm.role,
          age: parseOptionalNumber(profileForm.age),
          organizationId: currentUser?.organizationId ?? null,
          assignmentIds: currentUser?.assignmentIds ?? [],
        };

        return apiRequest<UserDto>(`/auth/user/edit/${session.userId}`, {
          method: "PUT",
          json: payload,
        });
      },
      t("feedback.profileUpdated"),
    );

    if (!updatedUser) {
      return;
    }

    setCurrentUser(updatedUser);
    setSelectedUser(updatedUser);
    setUsers((previous) =>
      previous.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
    );
    setDirectoryUsers((previous) =>
      previous.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
    );
    setProfileForm((previous) => ({ ...previous, password: "" }));
    saveAuthSession({
      ...session,
      role: updatedUser.role,
      issuedAt: session.issuedAt,
    });
  };

  const handleLoadUsers = async () => {
    const snapshot = await runAction(
      "users",
      async () => {
        const nextSnapshot = await refreshWorkspaceSnapshot();

        if (!nextSnapshot?.currentUser) {
          throw new Error(t("feedback.workspaceRefreshError"));
        }

        return nextSnapshot;
      },
      isAdmin
        ? t("feedback.usersLoaded")
        : isLeader
          ? t("feedback.usersLoaded")
          : t("feedback.accountAlreadyVisible"),
    );

    if (snapshot?.currentUser) {
      setSelectedUser((previous) => syncSelectedItem(snapshot.directoryUsers, previous) ?? snapshot.currentUser);
    }
  };

  const handleLookupUser = async () => {
    const userId = parseRequiredNumber(userLookupId, requiredFieldMessage("fields.teammate"));
    if (!isAdmin && !visibleUserIds.has(userId)) {
      setFeedback("users", {
        tone: "error",
        message: t("feedback.onlyScopeTeammatesOpen"),
      });
      return;
    }

    const localUser = directoryUsers.find((user) => user.id === userId) ?? users.find((user) => user.id === userId);
    const user = await runAction(
      "users",
      () =>
        localUser
          ? Promise.resolve(localUser)
          : apiRequest<UserDto>(`/auth/user/${userId}`),
      t("feedback.userLoaded"),
    );

    if (user) {
      setSelectedUser(user);
    }
  };

  const handleDeleteUser = async () => {
    if (!canDeleteUsers) {
      setFeedback("users", { tone: "error", message: t("feedback.onlyAdminsDeleteUsers") });
      return;
    }

    const userId = parseRequiredNumber(deleteUserId, requiredFieldMessage("fields.teammate"));

    if (!window.confirm(t("feedback.deleteUserConfirm", { name: getUserName(users, currentUser, t, userId) }))) {
      return;
    }

    const deletedUser = await runAction(
      "users",
      () => apiRequest<UserDto>(`/auth/user/delete/${userId}`, { method: "DELETE" }),
      t("feedback.userDeleted"),
    );

    if (!deletedUser) {
      return;
    }

    setUsers((previous) => previous.filter((user) => user.id !== userId));
    setDirectoryUsers((previous) => previous.filter((user) => user.id !== userId));
    setSelectedUser((previous) => (previous?.id === userId ? null : previous));

    if (session?.userId === userId) {
      handleSignOut();
      return;
    }

    await refreshWorkspaceSnapshot();
  };

  return {
    handleProfileUpdate,
    handleLoadUsers,
    handleLookupUser,
    handleDeleteUser,
  };
}

function getUserName(
  users: UserDto[],
  currentUser: UserDto | null,
  t: Translate,
  userId?: number | null,
) {
  if (userId == null) {
    return t("common.notAssigned");
  }

  const user = users.find((candidate) => candidate.id === userId) ?? (currentUser?.id === userId ? currentUser : null);
  return user ? user.fullName : t("fallback.unknownTeammate");
}
