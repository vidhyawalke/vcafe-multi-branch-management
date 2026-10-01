import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DemoPersonaBar from './components/DemoPersonaBar';
import DashboardTab from './components/DashboardTab';
import PosTab from './components/PosTab';
import InventoryTab from './components/InventoryTab';
import BranchesTab from './components/BranchesTab';
import ReceiptModal from './components/ReceiptModal';
import RestockModal from './components/RestockModal';
import TransferModal from './components/TransferModal';
import LoginModal from './components/LoginModal';
import { api, setAuthSession, getStoredUser } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pos');
  const [receiptData, setReceiptData] = useState(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [allInventory, setAllInventory] = useState([]);
  const [toast, setToast] = useState(null);

  // Initialize demo session on launch
  useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      setCurrentUser(existing);
    } else {
      // Auto-login as Owner for instant preview
      handleSwitchPersona('owner');
    }
    loadMasterInventory();
  }, []);

  async function loadMasterInventory() {
    try {
      const res = await api.inventory.getInventory();
      setAllInventory(res.data || []);
    } catch (e) {
      console.error(e);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSwitchPersona(personaId) {
    try {
      const res = await api.auth.demoLogin(personaId);
      if (res.success) {
        setAuthSession(res.data.token, res.data.user);
        setCurrentUser(res.data.user);
        showToast(res.message);

        // Adjust tab if staff cannot access certain views
        if (res.data.user.role === 'staff' && (activeTab === 'dashboard' || activeTab === 'branches')) {
          setActiveTab('pos');
        }
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  }

  function handleLogout() {
    setAuthSession(null, null);
    setCurrentUser(null);
    showToast('Signed out of VCafe.');
  }

  function handleOrderComplete(newOrder) {
    setReceiptData(newOrder);
    loadMasterInventory();
    showToast(`Order #${newOrder.orderNumber} placed & billed!`);
  }

  function handleOpenRestock(item) {
    setSelectedRestockItem(item || null);
    setRestockModalOpen(true);
  }

  function handleOpenTransfer() {
    setTransferModalOpen(true);
  }

  return (
    <div className="app-container">
      {/* Recruiter persona bar */}
      <DemoPersonaBar currentUser={currentUser} onSwitchPersona={handleSwitchPersona} />

      {/* Main navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        openLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Main Tab Screen */}
      <main className="main-content">
        {activeTab === 'pos' && (
          <PosTab currentUser={currentUser} onOrderComplete={handleOrderComplete} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab currentUser={currentUser} onViewReceipt={(order) => setReceiptData(order)} />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            currentUser={currentUser}
            onOpenRestock={handleOpenRestock}
            onOpenTransfer={handleOpenTransfer}
          />
        )}

        {activeTab === 'branches' && <BranchesTab currentUser={currentUser} />}
      </main>

      {/* Modals */}
      <ReceiptModal receiptData={receiptData} onClose={() => setReceiptData(null)} />

      <RestockModal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        selectedItem={selectedRestockItem}
        allInventory={allInventory}
        onSuccess={() => {
          loadMasterInventory();
          showToast('Stock inventory updated successfully!');
        }}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        allInventory={allInventory}
        onSuccess={() => {
          loadMasterInventory();
          showToast('Inter-branch stock transfer completed!');
        }}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />

      {/* Toast popup */}
      {toast && (
        <div className="toast-notice">
          <span style={{ fontSize: '16px' }}>☕</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
