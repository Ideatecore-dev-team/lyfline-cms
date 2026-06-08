import { useEffect, useState } from "react";
import { type User, authApi } from "../../shared/api/auth";
import { lookupUsers } from "../../shared/api/user/lookupUser";
import { addUser } from "../../shared/api/user/addUser";
import { editUser } from "../../shared/api/user/editUser";
import { deleteUser } from "../../shared/api/user/deleteUser";
import Sidebar from "../../widgets/Sidebar";
import Button from "../../component/button";
import ManageUserModal from "../../component/modal/manageUser";
import Badge from "../../component/badge";
import DeleteConfirmationModal from "../../component/modal/deleteConfirmation";

const Icon = ({ name, className = "size-5 bg-current" }: { name: string; className?: string }) => (
  <span
    style={{
      maskImage: `url("/icons/${name}.svg")`,
      WebkitMaskImage: `url("/icons/${name}.svg")`,
    }}
    className={`mask-contain mask-no-repeat mask-center shrink-0 inline-block ${className}`}
    aria-hidden="true"
  />
);

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await lookupUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setShowAddModal(false);
  };

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteClick = (user: User) => {
    if (currentUser && currentUser.id === user.id) {
      alert("You cannot delete your own account.");
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      fetchUsers();
    } catch (err: any) {
      alert("Failed to delete user: " + (err.message || err));
    }
  };

  if (currentUser && currentUser.role !== "super_admin") {
    return (
      <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 overflow-hidden">
        <Sidebar minimal />
        <div className="flex-1 p-8 bg-white rounded-[32px] flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm text-center">
          <div className="p-4 bg-red-50 rounded-full text-red-500 mb-4">
            <Icon name="Danger Circle" className="size-12 bg-current" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Access Denied</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-2 font-sans">
            You do not have the required administrative permissions to manage portal accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-0 py-8 inline-flex justify-center items-start gap-6 bg-background">
      {/* Left Sidebar */}
      <Sidebar minimal />

      {/* Main Content Card */}
      <div className="flex-1 p-6 bg-white rounded-[32px] inline-flex flex-col justify-start items-start gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
        {/* Header Block */}
        <div className="self-stretch inline-flex justify-start items-start gap-6">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
            <div className="self-stretch justify-start text-primary text-3xl font-medium font-['Poppins']">
              Manage User
            </div>
            <div className="justify-start">
              <span className="text-black text-sm font-normal font-['Poppins']">
                Manage your CMS account here, this page only visible to{" "}
              </span>
              <span className="text-primary text-sm font-medium font-['Poppins']">
                Super Admin
              </span>
            </div>
          </div>
          {/* Add User Button */}
          <Button
            onClick={() => {
              setEditingUser(null);
              setShowAddModal(true);
            }}
            text="Add User"
            leftIcon="Add"
          />
        </div>

        {/* Divider */}
        <div className="self-stretch h-px bg-slate-100" />

        {/* Table Container */}
        <div className="self-stretch bg-white flex flex-col justify-start items-start gap-2 overflow-hidden">
          {/* Table Header */}
          <div className="self-stretch h-9 rounded-sm inline-flex justify-start items-start overflow-hidden">
            <div className="w-16 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
              <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                  No.
                </div>
              </div>
            </div>
            <div className="flex-1 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
              <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                  Username
                </div>
              </div>
            </div>
            <div className="w-80 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
              <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                  Email
                </div>
              </div>
            </div>
            <div className="w-44 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
              <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                  Role
                </div>
              </div>
            </div>
            <div className="w-28 self-stretch bg-indigo-50 inline-flex flex-col justify-center items-start">
              <div className="self-stretch flex-1 px-3 py-4 inline-flex justify-start items-center gap-2 overflow-hidden">
                <div className="justify-start text-primary text-sm font-medium font-['Poppins']">
                  Action
                </div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          {loading && users.length === 0 ? (
            <div className="self-stretch p-12 text-center text-slate-400 font-sans">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="self-stretch p-12 text-center text-slate-400 font-sans">
              No users found.
            </div>
          ) : (
            users.map((user, index) => (
              <div
                key={user.id}
                className="self-stretch bg-white/0 inline-flex justify-start items-center overflow-hidden border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
              >
                <div className="w-16 self-stretch inline-flex flex-col justify-center items-start">
                  <div className="self-stretch p-3 flex flex-col justify-center items-start overflow-hidden">
                    <div className="self-stretch justify-start text-black/90 text-sm font-normal font-['Poppins']">
                      {index + 1}.
                    </div>
                  </div>
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start">
                  <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                    <div className="self-stretch justify-start text-black/90 text-sm font-normal font-['Poppins']">
                      {user.name}
                    </div>
                  </div>
                </div>
                <div className="w-80 self-stretch inline-flex flex-col justify-center items-start">
                  <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                    <div className="self-stretch justify-start text-neutral-900 text-sm font-normal font-['Poppins']">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="w-44 self-stretch inline-flex flex-col justify-center items-start">
                  <div className="self-stretch flex-1 p-3 flex flex-col justify-center items-start overflow-hidden">
                    <Badge
                      text={
                        user.role === "super_admin"
                          ? "Super Admin"
                          : user.role === "admin"
                            ? "Admin"
                            : user.role === "editor"
                              ? "Editor"
                              : user.role
                      }
                      variant={
                        user.role === "super_admin"
                          ? "purple"
                          : user.role === "admin"
                            ? "blue"
                            : "blue"
                      }
                    />
                  </div>
                </div>
                <div className="w-28 px-3 flex justify-start items-center gap-4 py-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditClick(user)}
                    className="size-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg outline -outline-offset-1 outline-slate-300 hover:outline-slate-500 flex justify-center items-center transition-all cursor-pointer active:scale-95"
                    title="Edit User"
                  >
                    <Icon name="Pen" className="size-5 bg-current" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(user)}
                    disabled={currentUser?.id === user.id}
                    className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all disabled:opacity-30 disabled:hover:bg-red-600 cursor-pointer active:scale-95"
                    title="Delete User"
                  >
                    <Icon name="Delete 2" className="size-5 bg-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <ManageUserModal
        isOpen={showAddModal || !!editingUser}
        user={editingUser}
        onClose={() => {
          setShowAddModal(false);
          setEditingUser(null);
        }}
        onSubmit={async (data) => {
          if (editingUser) {
            await editUser(editingUser.id, data.name, data.email, data.password);

            // Update current user cache if it was edited
            if (currentUser && currentUser.id === editingUser.id) {
              const updatedSelf = { ...currentUser, name: data.name, email: data.email };
              localStorage.setItem('lyfline_current_user', JSON.stringify(updatedSelf));
            }
            fetchUsers();
          } else {
            if (!data.password) {
              throw new Error("Password is required for adding a user.");
            }
            await addUser(data.name, data.email, data.password);
            fetchUsers();
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove User"
        message={userToDelete ? `Are you sure you want to remove administrator "${userToDelete.name}"? This action cannot be undone.` : ""}
      />
    </div>
  );
}

export default UserManagementPage;
