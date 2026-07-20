        <?php if (!in_array(basename($_SERVER['PHP_SELF']), ['index.php', 'signup.php', 'forgot_pass.php', 'reset.php'])): ?>
            </main>
            
            <footer class="text-center py-4 border-top" style="border-color: var(--border-color) !important; background: var(--bg-card); color: var(--text-secondary); margin-left: 260px; font-size: 0.85rem;">
                <div class="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                    <p class="mb-0">© 2026 BullVest Trading. All Rights Reserved.</p>
                    <p class="mb-0">Securely developed by BullVest FinTech team.</p>
                </div>
            </footer>
        <?php endif; ?>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom scripts -->
    <script src="<?= $basePath ?>assets/js/custom.js"></script>
    <script src="<?= $basePath ?>assets/js/search.js"></script>
    
    <!-- AJAX helper to mark notifications as read -->
    <script>
        function markAllNotificationsRead() {
            $.ajax({
                url: '<?= $basePath ?>api/notifications.php',
                type: 'POST',
                data: { 
                    action: 'mark_all_read',
                    csrf_token: '<?= $_SESSION['csrf_token'] ?? '' ?>'
                },
                success: function(response) {
                    if (response.success) {
                        $('.badge-dot').remove();
                        $('.notifications-list').html('<div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No new notifications</div>');
                    }
                }
            });
        }
    </script>
</body>
</html>
