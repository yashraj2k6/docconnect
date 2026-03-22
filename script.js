document.addEventListener("DOMContentLoaded", function () {

    // Helper function to safely add listeners
    const safeListener = (selector, event, callback) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            elements.forEach(el => el.addEventListener(event, callback));
        }
    };

    /* --- 1. FAQ TOGGLE --- */
    safeListener(".faq-item", "click", function() {
        this.classList.toggle("active");
    });

    /* --- 2. ABOUT ACCORDION --- */
    const aboutItems = document.querySelectorAll(".about-item");
    if (aboutItems.length > 0) {
        aboutItems.forEach(item => {
            item.addEventListener("click", function() {
                aboutItems.forEach(i => { if (i !== this) i.classList.remove("active"); });
                this.classList.toggle("active");
            });
        });
    }

    /* --- 3. ENQUIRY FORM (ID Check) --- */
    const formContainer = document.getElementById("enquiryform");
    const openBtn = document.getElementById("openEnquiry");
    const closeBtn = document.querySelector(".close-btn");

    if (openBtn && formContainer) {
        openBtn.onclick = () => {
            formContainer.style.display = "block";
            document.body.style.overflow = "hidden";
        };
        if (closeBtn) {
            closeBtn.onclick = () => {
                formContainer.style.display = "none";
                document.body.style.overflow = "auto";
            };
        }
        window.addEventListener("click", (e) => {
            if (e.target === formContainer) {
                formContainer.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    /* --- 4. READ MORE TOGGLE --- */
const readMoreButtons = document.querySelectorAll('.read-more-btn');

readMoreButtons.forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Find the parent div (benefit-text) then find the span inside it
        const parent = this.closest('.benefit-text');
        const extraText = parent.querySelector('.extra-text');

        if (extraText) {
            // Check current display state
            const isHidden = window.getComputedStyle(extraText).display === "none";
            
            if (isHidden) {
                extraText.style.display = "inline";
                this.textContent = "Read Less...";
            } else {
                extraText.style.display = "none";
                this.textContent = "Read More...";
            }
        }
    });
});
});