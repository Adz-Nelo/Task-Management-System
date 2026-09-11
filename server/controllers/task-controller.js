import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";
import sendEmail from "../config/nodemailer.js";

// Create task
export const createTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      projectId,
      title,
      description,
      type,
      status,
      priority,
      assigneeId,
      due_date,
    } = req.body;

    const origin = req.get("origin");

    // Check if user has admin role for project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    } else if (
      assigneeId &&
      !project.members.find((member) => member.user.id === assigneeId)
    ) {
      return res.status(403).json({
        message: "Assignee is not a member of this project / workspace",
      });
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        assigneeId,
        status,
        type,
        due_date: new Date(due_date),
      },
    });

    const taskWithAssignee = await prisma.task.findUnique({
      where: { id: task.id },
      include: { assignee: true, project: true },
    });

    // Send assignment email directly from controller for reliability
    if (taskWithAssignee?.assignee) {
      try {
        const taskDueDate = new Date(
          taskWithAssignee.due_date
        ).toLocaleDateString("en-US", {
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%); padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">New Task Assigned</h1>
                        <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">You have been assigned a new task</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin: 0 0 24px 0; color: #e2e8f0; font-size: 16px; line-height: 1.6;">Hi <strong style="color: #60a5fa;">${
                          taskWithAssignee.assignee.name
                        }</strong>,</p>
                        <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                          A new task has been assigned to you in <strong style="color: #e2e8f0;">${
                            taskWithAssignee.project.name
                          }</strong>.
                        </p>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #0f172a; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 24px;">
                              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Task Title</p>
                              <p style="margin: 0 0 20px 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">${
                                taskWithAssignee.title
                              }</p>
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                  <td width="50%" style="padding-right: 10px;">
                                    <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Due Date</p>
                                    <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500;">${taskDueDate}</p>
                                  </td>
                                  <td width="50%" style="padding-left: 10px;">
                                    <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Status</p>
                                    <p style="margin: 0; color: #e2e8f0; font-size: 14px; font-weight: 500; display: inline-block; padding: 2px 10px; background: #1e3a8a; color: #93c5fd; border-radius: 20px; font-size: 12px;">${taskWithAssignee.status.replace(
                                      "_",
                                      " "
                                    )}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border-radius: 8px; text-align: center;">
                              <a href="${origin}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">View Task</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
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
          to: taskWithAssignee.assignee.email,
          subject: `New Task Assigned in ${taskWithAssignee.project.name}`,
          body: htmlBody,
        });
        console.log(
          `Assignment email sent directly to: ${taskWithAssignee.assignee.email}`
        );
      } catch (emailError) {
        console.error(
          "Failed to send task assignment email directly:",
          emailError
        );
      }
    }

    // Still send Inngest event for reminder functionality
    try {
      await inngest.send({
        name: "app/task.assigned",
        data: {
          taskId: task.id,
          origin,
        },
      });
    } catch (inngestError) {
      console.error("Failed to send Inngest event:", inngestError);
    }

    res.json({ task: taskWithAssignee, message: "Task created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { userId } = await req.auth();

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    const updateTask = await prisma.task.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ task: updateTask, message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { taskIds } = req.body;
    console.log("Delete task request - taskIds:", taskIds, "userId:", userId);

    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
    });
    console.log("Found tasks:", tasks);

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Tasks not found" });
    }

    const project = await prisma.project.findUnique({
      where: { id: tasks[0].projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } else if (project.team_lead !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have admin privileges for this project" });
    }

    await prisma.task.deleteMany({
      where: { id: { in: taskIds } },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
