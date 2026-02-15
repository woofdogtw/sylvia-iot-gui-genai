# Change: Add User Profile Dialog

## Summary

Add a "Profile" option to the user dropdown menu in the shell header, allowing any authenticated user to view and edit their own profile (name, password, info) via the coremgr user API.

## Motivation

Currently the only way to edit a user's own profile is through the admin/manager User Management page, which normal users cannot access. Users need a self-service way to update their display name, change their password, and manage their info metadata.

## Scope

- **MODIFIED** shell spec: add profile menu item and dialog to the Authentication Integration requirement
- Shell `MainLayout.vue`: add "Profile" item to user dropdown menu
- Profile dialog component with Name, Password, Info (JSON) fields
- API call via coremgr `PATCH /api/v1/user/{userId}` using the current user's userId from tokeninfo
- After successful update, refresh tokeninfo to reflect name changes in the header

## Out of Scope

- Profile photo/avatar upload
- Email or account name changes
- Role self-modification
