// PHASE 3: PLACEHOLDER UI SCRIPTS
// Handles basic menu toggles for the static design.
// Note: This is NOT the final JS for the project. 
// It is only meant to support the static UI design in Phase 3 for Lab documentation purposes. 
// In Phase 4, we will replace this with more complex logic that interacts with the backend API.


document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile responsiveness sidebar Logic (Open & Click-Outside Close)
    
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (mobileNavToggle && sidebar) {
        // Toggle sidebar clicked
        mobileNavToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop click from immediately triggering the document listener
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking anywhere outside of it
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open')) {
                // If the click is NOT inside the sidebar and NOT on the hamburger button
                if (!sidebar.contains(e.target) && !mobileNavToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }
});