import { Inngest } from "inngest";
import { serve } from "inngest/express";
import { prisma } from "../config/prisma.js";
import sendEmail from "../config/nodemailer.js";

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
    triggers: { event: "clerk/organization.created" },
  },

  async ({ event }) => {
    const { data } = event;

    // Try to get the creator's user ID from the event data
    // Clerk may provide it as created_by or inside the members array
    let creatorId = data.created_by;
    if (!creatorId && data.members && Array.isArray(data.members)) {
      creatorId = data.members[0]?.user_id || data.members[0]?.userId;
    }

    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: creatorId,
        image_url: data.image_url,
      },
    });

    // Add creator as ADMIN member (use upsert to avoid duplicate errors)
    if (creatorId) {
      const existingMember = await prisma.workspaceMember.findFirst({
        where: {
          userId: creatorId,
          workspaceId: data.id,
        },
      });

      if (existingMember) {
        await prisma.workspaceMember.update({
          where: { id: existingMember.id },
          data: { role: "ADMIN" },
        });
      } else {
        await prisma.workspaceMember.create({
          data: {
            userId: creatorId,
            workspaceId: data.id,
            role: "ADMIN",
          },
        });
      }
    }
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

// Inngest function to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
  { id: "send-task-assignment-mail" },
  { event: "app/task.assigned" },
  
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true },
    });

    const taskDueDate = new Date(task.due_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Task Assigned</title>
      </head>
      <body style="margin:0; padding:0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">New Task Assigned</h1>
                    <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">You have been assigned a new task</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px 0; color: #e2e8f0; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #60a5fa;">${
                      task.assignee.name
                    }</strong>,</p>
                    
                    <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                      A new task has been assigned to you in <strong style="color: #e2e8f0;">${
                        task.project.name
                      }</strong>.
                    </p>

                    <!-- Task Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #0f172a; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Task Title</p>
                          <p style="margin: 0 0 20px 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">${
                            task.title
                          }</p>
                          
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50%" style="padding-right: 10px;">
                                <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Due Date</p>
                                <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500;">${taskDueDate}</p>
                              </td>
                              <td width="50%" style="padding-left: 10px;">
                                <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status</p>
                                <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500; display: inline-block; padding: 2px 10px; background: #1e3a8a; color: #93c5fd; border-radius: 20px; font-size: 12px;">${task.status.replace(
                                  "_",
                                  " "
                                )}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                      <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 8px; text-align: center;">
                          <a href="${origin}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">View Task</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background: #0f172a; padding: 20px 40px; text-align: center; border-top: 1px solid #334155;">
                    <p style="margin: 0; color: #64748b; font-size: 12px;">Task Management System</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assigned in ${task.project.name}`,
      body: htmlBody,
    });

    if (taskDueDate !== new Date().toDateString()) {
      await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));
      await step.run("check-if-task-is-completed", async () => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        if (!task) return;

        if (task.status !== "DONE") {
          await step.run("send-task-reminder-mail", async () => {
            const reminderDueDate = new Date(task.due_date).toLocaleDateString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            const reminderHtmlBody = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Task Reminder</title>
              </head>
              <body style="margin:0; padding:0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); min-height: 100vh; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Task Reminder</h1>
                            <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">This task is still pending</p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding: 40px;">
                            <p style="margin: 0 0 24px 0; color: #e2e8f0; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #60a5fa;">${
                              task.assignee.name
                            }</strong>,</p>
                            
                            <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                              This is a friendly reminder that the following task in <strong style="color: #e2e8f0;">${
                                task.project.name
                              }</strong> is still pending and past its due date.
                            </p>

                            <!-- Task Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #0f172a; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Task Title</p>
                                  <p style="margin: 0 0 20px 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">${
                                    task.title
                                  }</p>
                                  
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td width="50%" style="padding-right: 10px;">
                                        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Due Date</p>
                                        <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500;">${reminderDueDate}</p>
                                      </td>
                                      <td width="50%" style="padding-left: 10px;">
                                        <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status</p>
                                        <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500; display: inline-block; padding: 2px 10px; background: #1e3a8a; color: #93c5fd; border-radius: 20px; font-size: 12px;">${task.status.replace(
                                          "_",
                                          " "
                                        )}</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                              <tr>
                                <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 8px; text-align: center;">
                                  <a href="${origin}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">View Task</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background: #0f172a; padding: 20px 40px; text-align: center; border-top: 1px solid #334155;">
                            <p style="margin: 0; color: #64748b; font-size: 12px;">Task Management System</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `;

            await sendEmail({
              to: task.assignee.email,
              subject: `Reminder: ${task.title} is still pending`,
              body: reminderHtmlBody,
            });
          });
        }
      });
    }
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
  sendTaskAssignmentEmail,
];

// Export the Express serve handler
export const inngestServe = serve({
  client: inngest,
  functions,
  serveHost: process.env.INNGEST_SERVE_HOST,
  servePath: "/api/inngest",
});
