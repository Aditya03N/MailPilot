import User from '../models/User.js';
import Team from '../models/Team.js';
import { generateToken, generateTeamCode } from '../utils/token.js';
import { generateClientEmailInbox } from '../services/email/clientSyncService.js';
import { emitToTeam } from '../config/socket.js';

// @desc    Register a new user & create/join team
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, mode, workspaceName, teamCode, requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    let team;
    let role = requestedRole || 'assistant';
    let membershipStatus = 'active';

    if (mode === 'create') {
      if (!workspaceName) {
        return res.status(400).json({ success: false, message: 'Please provide a workspace name.' });
      }
      role = 'assistant'; // Creator is default primary assistant
      membershipStatus = 'active';

      const generatedCode = generateTeamCode(workspaceName);
      
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: 'assistant',
        membershipStatus: 'active',
      });

      team = await Team.create({
        name: workspaceName,
        teamCode: generatedCode,
        createdBy: user._id,
      });

      user.teamId = team._id;
      await user.save();

      // Notice: As per requirement, newly registered PA starts with 0 emails because no client is connected yet!

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: team._id,
          membershipStatus: user.membershipStatus,
        },
        team: {
          id: team._id,
          name: team.name,
          teamCode: team.teamCode,
        },
      });
    } else {
      // Joining existing workspace
      if (!teamCode) {
        return res.status(400).json({ success: false, message: 'Please provide a valid Team Code.' });
      }

      team = await Team.findOne({ teamCode: teamCode.trim().toUpperCase() });
      if (!team) {
        return res.status(404).json({ success: false, message: 'Invalid Team Code. No workspace found.' });
      }

      role = requestedRole === 'client' ? 'client' : 'assistant';
      membershipStatus = role === 'assistant' ? 'pending' : 'active';

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role,
        teamId: team._id,
        membershipStatus,
      });

      // When an actual Client joins, automatically ingest their real-time emails into the PA-Client workspace bridge!
      if (role === 'client') {
        await generateClientEmailInbox(team._id, user);
      }

      // Notify the primary PA real-time that a client has joined
      emitToTeam(team._id, 'member_joined', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: team._id,
          membershipStatus: user.membershipStatus,
        },
        team: {
          id: team._id,
          name: team.name,
          teamCode: team.teamCode,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your email and password.' });
    }

    if (user.membershipStatus === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your workspace membership has been rejected.' });
    }

    let team = null;
    if (user.teamId) {
      team = await Team.findById(user.teamId);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        membershipStatus: user.membershipStatus,
      },
      team: team ? {
        id: team._id,
        name: team.name,
        teamCode: team.teamCode,
      } : null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let team = null;
    if (user.teamId) {
      team = await Team.findById(user.teamId);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        membershipStatus: user.membershipStatus,
      },
      team: team ? {
        id: team._id,
        name: team.name,
        teamCode: team.teamCode,
      } : null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear token on client
// @route   POST /api/auth/logout
// @access  Public
export const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

