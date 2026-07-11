import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
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
import Notification from "../../component/notification";
import Pagination from "../../component/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "default";
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const showNotif = (message: string, type: "success" | "error" | "default" = "success") => {
    setNotification({
      isOpen: true,
      message,
      type,
    });
  };

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await lookupUsers();
      setUsers(data);
      setCurrentPage(1);
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
    if (user.role === "super_admin") return;
    setEditingUser(user);
    setShowAddModal(false);
  };

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteClick = (user: User) => {
    if (currentUser && currentUser.id === user.id) {
      showNotif("You cannot delete your own account.", "error");
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      showNotif(`User "${userToDelete.name}" deleted successfully!`, "success");
      fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      showNotif("Failed to delete user: " + errorMessage, "error");
    }
  };

  if (currentUser && currentUser.role !== "super_admin") {
    return <Navigate to="/cms/promo" replace />;
  }

  return (
    <div className="w-full px-0 py-4 lg:py-8 flex flex-col lg:flex-row justify-center items-stretch lg:items-start gap-6 bg-background">
      {/* Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar minimal />
      </div>

      {/* Main Content Card */}
      <div className="flex-1 h-[820px] p-6 bg-white rounded-[32px] flex flex-col justify-start items-stretch gap-6 overflow-hidden shadow-[0px_2px_2px_0px_rgba(0,0,0,0.05)] border border-slate-100/50">
        {/* Header Block */}
        <div className="self-stretch flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-4 sm:gap-6">
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
          <div className="shrink-0 w-full sm:w-auto">
            <Button
              onClick={() => {
                setEditingUser(null);
                setShowAddModal(true);
              }}
              text="Add User"
              leftIcon="Add"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="self-stretch h-px bg-slate-100" />

        {/* Table Container */}
        <div className="self-stretch flex-1 bg-white flex flex-col justify-start items-stretch gap-2 overflow-hidden w-full">
          <div className="w-full flex-1 overflow-x-auto">
            <div className="min-w-[800px] flex flex-col items-stretch gap-2">
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
                users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user, index) => (
                  <div
                    key={user.id}
                    className="self-stretch bg-white/0 inline-flex justify-start items-center overflow-hidden border-b border-slate-100 hover:bg-slate-50/40 transition-colors"
                  >
                    <div className="w-16 self-stretch inline-flex flex-col justify-center items-start">
                      <div className="self-stretch p-3 flex flex-col justify-center items-start overflow-hidden">
                        <div className="self-stretch justify-start text-black/90 text-sm font-normal font-['Poppins']">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
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
                        disabled={user.role === "super_admin"}
                        className="size-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg outline -outline-offset-1 outline-slate-300 hover:outline-slate-500 flex justify-center items-center transition-all disabled:opacity-30 disabled:hover:bg-slate-100 cursor-pointer active:scale-95 disabled:pointer-events-none"
                        title="Edit User"
                      >
                        <Icon name="Pen" className="size-5 bg-current" />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={currentUser?.id === user.id || user.role === "super_admin"}
                        className="size-9 bg-red-600 hover:bg-red-700 text-white rounded-lg flex justify-center items-center transition-all disabled:opacity-30 disabled:hover:bg-red-600 cursor-pointer active:scale-95 disabled:pointer-events-none"
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
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={users.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
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
            try {
              await editUser(editingUser.id, data.name, data.email, data.password);

              // Update current user cache if it was edited
              if (currentUser && currentUser.id === editingUser.id) {
                const updatedSelf = { ...currentUser, name: data.name, email: data.email };
                localStorage.setItem('lyfline_current_user', JSON.stringify(updatedSelf));
              }
              showNotif(`User "${data.name}" updated successfully!`, "success");
              fetchUsers();
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              showNotif("Failed to update user: " + errorMessage, "error");
              throw err;
            }
          } else {
            if (!data.password) {
              throw new Error("Password is required for adding a user.");
            }
            try {
              await addUser(data.name, data.email, data.password);
              showNotif(`User "${data.name}" added successfully!`, "success");
              fetchUsers();
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              showNotif("Failed to add user: " + errorMessage, "error");
              throw err;
            }
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

      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default UserManagementPage;
