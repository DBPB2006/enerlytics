<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    /**
     * Reusable role checker helper validating pivot memberships
     */
    private function hasRole($group, $roles)
    {
        return $group->users()
            ->where('user_id', auth()->id())
            ->whereIn('group_user.role', (array) $roles)
            ->wherePivot('status', 'approved')
            ->exists();
    }

    /**
     * Get groups the user belongs to
     */
    public function index(Request $request)
    {
        $groups = $request->user()->groups()->wherePivot('status', 'approved')->get();
        return response()->json($groups);
    }

    /**
     * Get details of a single group if the user is an approved member
     */
    public function show(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        $isMember = $group->users()
            ->where('user_id', auth()->id())
            ->wherePivot('status', 'approved')
            ->exists();

        if (! $isMember) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $group->load(['users' => function ($query) {
            $query->where('users.id', auth()->id());
        }]);

        return response()->json($group);
    }

    /**
     * Discover groups the user is not in
     */
    public function discover(Request $request)
    {
        $joinedGroupIds = $request->user()->groups()->pluck('groups.id');
        $groups = Group::whereNotIn('id', $joinedGroupIds)->get();

        return response()->json($groups);
    }

    /**
     * Create a new cooperative group
     */
    public function store(Request $request)
    {
        if (! $request->user()->mfa_enabled) {
            return response()->json([
                'error' => 'MFA_REQUIRED',
                'message' => 'Multi-Factor Authentication (MFA) setup is mandatory for creating a community.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:3|max:255',
            'description' => 'required|string|min:10',
            'location' => 'required|string|max:255',
        ], [
            'name.required' => 'Group name is required.',
            'name.min' => 'Group name must be at least 3 characters.',
            'name.max' => 'Group name cannot exceed 255 characters.',
            'location.required' => 'Location/Region is required.',
            'location.max' => 'Location/Region cannot exceed 255 characters.',
            'description.required' => 'Description/Mission statement is required.',
            'description.min' => 'Description must be at least 10 characters.',
        ]);

        $group = Group::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'owner_id' => $request->user()->id,
        ]);

        // Attach group creator as owner with approved status on the pivot table
        $group->users()->attach($request->user()->id, [
            'role' => 'owner',
            'status' => 'approved',
        ]);

        return response()->json($group, 201);
    }

    /**
     * Request to join a group, adding a pending pivot record
     */
    public function join(Request $request, $id)
    {
        if (! $request->user()->mfa_enabled) {
            return response()->json([
                'error' => 'MFA_REQUIRED',
                'message' => 'Multi-Factor Authentication (MFA) setup is mandatory for joining a community.'
            ], 403);
        }

        $group = Group::findOrFail($id);

        if ($group->users()->where('user_id', $request->user()->id)->exists()) {
            return response()->json(['error' => 'Already requested or joined'], 400);
        }

        $group->users()->attach($request->user()->id, [
            'role' => 'member',
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Join request sent']);
    }

    /**
     * Leave a group, detaching the pivot record
     */
    public function leave(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        if ($group->owner_id === $request->user()->id) {
            return response()->json(['error' => 'Owners cannot leave. Delete the group instead.'], 400);
        }

        $group->users()->detach($request->user()->id);

        return response()->json(['message' => 'Left group successfully']);
    }

    /**
     * Get pending join requests
     */
    public function requests(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        if (! $this->hasRole($group, ['owner', 'admin'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $requests = $group->users()
            ->wherePivot('status', 'pending')
            ->get();

        return response()->json($requests);
    }

    /**
     * Approve a user join request on the pivot table
     */
    public function approve(Request $request, $id, $userId)
    {
        $group = Group::findOrFail($id);

        if (! $this->hasRole($group, ['owner', 'admin'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $group->users()->updateExistingPivot($userId, ['status' => 'approved']);

        return response()->json(['message' => 'User approved']);
    }

    /**
     * Reject a user
     */
    public function reject(Request $request, $id, $userId)
    {
        $group = Group::findOrFail($id);

        if (! $this->hasRole($group, ['owner', 'admin'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $group->users()->detach($userId);

        return response()->json(['message' => 'User rejected']);
    }

    /**
     * Get all approved members of a group
     */
    public function members(Request $request, $id)
    {
        $group = Group::findOrFail($id);

        if (! $this->hasRole($group, ['owner', 'admin', 'member'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $members = $group->users()
            ->wherePivot('status', 'approved')
            ->get();

        return response()->json($members);
    }

    /**
     * Promote a user to admin
     */
    public function promote(Request $request, $id, $userId)
    {
        $group = Group::findOrFail($id);
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $group->users()->updateExistingPivot($userId, ['role' => 'admin']);
        return response()->json(['message' => 'User promoted']);
    }

    /**
     * Demote a user to member
     */
    public function demote(Request $request, $id, $userId)
    {
        $group = Group::findOrFail($id);
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        if ($group->owner_id == $userId) {
            return response()->json(['error' => 'Cannot demote owner'], 400);
        }

        $group->users()->updateExistingPivot($userId, ['role' => 'member']);
        return response()->json(['message' => 'User demoted']);
    }
}

