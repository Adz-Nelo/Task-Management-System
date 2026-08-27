import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { prisma } from "../config/prisma.js";

export const inngest = new Inngest({
  id: "project-management",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", triggers: { event: "clerk/user.created" } },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  }
);

// Inngest Function to delete user data to a database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk", triggers: { event: "clerk/user.deleted" } },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// Inngest Function to update user data to a database
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk", triggers: { event: "clerk/user.updated" } },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses[0]?.email_address,
        name: data?.first_name + " " + data?.last_name,
        image: data?.image_url,
      },
    });
  }
);

// Inngest function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-from-clerk",
    triggers: { event: "clerk/workspace.created" },
  },

  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    // Add creator as ADMIN member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: "ADMIN",
      },
    });
  }
);

// Inngest function to update workspace data in database
const syncWorkspaceUpdate = inngest.createFunction(
  {
    id: "update-workspace-from-clerk",
    triggers: { event: "clerk/organization.updated" },
  },

  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.upsert({
      where: {
        id: data.id,
      },
      create: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
        ownerId: data.created_by,
      },
      update: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  }
);

// Inngest function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "delete-workspace-with-clerk",
    triggers: { event: "clerk/organization.deleted" },
  },

  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// Inngest function to save workspace member data to a database
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-from-clerk",
    triggers: { event: "clerk/organizationInvitation.accepted" },
  },

  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  }
);

// Add the function to the exported array:
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
  syncWorkspaceCreation,
  syncWorkspaceUpdate,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];

// Export the Express serve handler
export const inngestServe = serve({
  client: inngest,
  functions,
  serveHost: process.env.INNGEST_SERVE_HOST,
  servePath: "/api/inngest",
});
