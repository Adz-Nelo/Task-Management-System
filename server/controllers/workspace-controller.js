import { prisma } from "../config/prisma.js";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ members: { some: { userId: userId } } }, { ownerId: userId }],
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });

    // Ensure owner is included in members if not already present
    const workspacesWithOwnerAsMember = workspaces.map((workspace) => {
      const ownerIsMember = workspace.members.some(
        (member) => member.userId === workspace.ownerId
      );
      if (!ownerIsMember && workspace.owner) {
        return {
          ...workspace,
          members: [
            ...workspace.members,
            {
              id: `owner-${workspace.id}`,
              userId: workspace.owner.id,
              workspaceId: workspace.id,
              role: "ADMIN",
              user: workspace.owner,
            },
          ],
        };
      }
      return workspace;
    });

    res.json({ workspaces: workspacesWithOwnerAsMember });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.code || error.message || "Something went wrong" });
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!workspaceId || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["ADMIN", "MEMBER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check creator has admin role or is the workspace owner
    if (
      workspace.ownerId !== userId &&
      !workspace.members.find(
        (member) => member.userId === userId && member.role === "ADMIN"
      )
    ) {
      return res
        .status(401)
        .json({ message: "You do not have admin privileges!" });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      (member) => member.userId === user.id
    );

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this workspace" });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    res.json({ member, message: "Member added successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: error.code || error.message || "Something went wrong" });
  }
};
