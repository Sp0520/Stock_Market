<?php
$isSubfolder = true;
require_once(dirname(__DIR__) . '/includes/header.php');

// Enforce admin permission
if (!$user || $user['role'] !== 'admin') {
    header("Location: ../market.php");
    exit();
}

$successMsg = '';
$errorMsg = '';

// Handle settings update mockup
if (isset($_POST['btnSaveSettings'])) {
    if (!isset($_POST['csrf_token']) || !validateCsrfToken($_POST['csrf_token'])) {
        $errorMsg = 'CSRF validation failed.';
    } else {
        $successMsg = 'Global configuration updated successfully (Mock save completed).';
    }
}
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h1 class="h3 fw-bold mb-1">Global Settings</h1>
        <p class="text-secondary mb-0 small">Manage BullVest core configurations and integrations</p>
    </div>
    <a href="dashboard.php" class="btn btn-sm btn-outline-secondary" style="border-radius: 8px;"><i class="bi bi-arrow-left me-1"></i> Admin Panel</a>
</div>

<?php if (!empty($successMsg)): ?>
    <div class="alert alert-success py-2 small" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i> <?= htmlspecialchars($successMsg) ?>
    </div>
<?php endif; ?>

<?php if (!empty($errorMsg)): ?>
    <div class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= htmlspecialchars($errorMsg) ?>
    </div>
<?php endif; ?>

<div class="row g-4">
    <div class="col-lg-8">
        <div class="fin-card">
            <h5 class="card-title mb-4">Platform Configuration</h5>
            
            <form action="" method="post">
                <?= getCsrfInput() ?>
                
                <h6 class="fw-bold text-primary mb-3">API Key Overrides (Read-Only via Dashboard Env Vars)</h6>
                <div class="mb-3">
                    <label class="text-secondary small fw-semibold mb-2">AlphaVantage Key (Active)</label>
                    <input type="text" class="form-control bg-transparent text-secondary border-secondary" value="<?= htmlspecialchars(getenv("ALPHAVANTAGE_API_KEY") ?: getenv("API_KEY") ?: "1DBYP9NP4ZDVPWI6") ?>" disabled style="border-radius: var(--border-radius);">
                    <div class="text-secondary small mt-1">Configure this variable in Render Dashboard under name `ALPHAVANTAGE_API_KEY`.</div>
                </div>
                
                <div class="mb-4">
                    <label class="text-secondary small fw-semibold mb-2">Marketstack Key (Active)</label>
                    <input type="text" class="form-control bg-transparent text-secondary border-secondary" value="<?= htmlspecialchars(getenv("MARKETSTACK_API_KEY") ?: "75e8ef804fbf5fa58ad3d7e5d8048253") ?>" disabled style="border-radius: var(--border-radius);">
                    <div class="text-secondary small mt-1">Configure this variable in Render Dashboard under name `MARKETSTACK_API_KEY`.</div>
                </div>
                
                <hr class="text-secondary my-4">
                <h6 class="fw-bold text-primary mb-3">Trading & Transaction Thresholds</h6>
                
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Maximum Daily Deposit (INR)</label>
                        <input type="number" class="form-control bg-transparent text-white border-secondary" name="max_deposit" value="500000" style="border-radius: var(--border-radius);">
                    </div>
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Minimum Withdrawal Limit (INR)</label>
                        <input type="number" class="form-control bg-transparent text-white border-secondary" name="min_withdraw" value="100" style="border-radius: var(--border-radius);">
                    </div>
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Standard Brokerage (Fee %)</label>
                        <input type="text" class="form-control bg-transparent text-white border-secondary" name="brokerage_fee" value="0.05%" style="border-radius: var(--border-radius);">
                    </div>
                    <div class="col-md-6">
                        <label class="text-secondary small fw-semibold mb-2">Platform Maintenance State</label>
                        <select class="form-select bg-transparent text-white border-secondary" name="maintenance" style="border-radius: var(--border-radius);">
                            <option value="0" class="text-dark" selected>OFF (Live Operations)</option>
                            <option value="1" class="text-dark">ON (Maintenance Mode)</option>
                        </select>
                    </div>
                </div>
                
                <button type="submit" name="btnSaveSettings" class="btn btn-primary-custom mt-4">Save Configuration</button>
            </form>
        </div>
    </div>
    
    <div class="col-lg-4">
        <div class="fin-card">
            <h5 class="card-title mb-3">System Health Status</h5>
            <div class="d-flex flex-column gap-3 mt-3">
                <div class="p-3 rounded d-flex justify-content-between align-items-center" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                    <div>
                        <div class="small fw-bold">Database Server</div>
                        <div class="text-secondary small mt-1">Clever Cloud MySQL</div>
                    </div>
                    <span class="badge-up">ONLINE</span>
                </div>
                <div class="p-3 rounded d-flex justify-content-between align-items-center" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                    <div>
                        <div class="small fw-bold">PHP Compiler Version</div>
                        <div class="text-secondary small mt-1">PHP <?= phpversion() ?></div>
                    </div>
                    <span class="badge-up">STABLE</span>
                </div>
                <div class="p-3 rounded d-flex justify-content-between align-items-center" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
                    <div>
                        <div class="small fw-bold">AlphaVantage Gateway</div>
                        <div class="text-secondary small mt-1">Standard HTTPS Port 443</div>
                    </div>
                    <span class="badge-up">CONNECTED</span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include_once(dirname(__DIR__) . '/includes/footer.php'); ?>
