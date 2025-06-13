const baseURL = `https://kuwait-enjoy-rocket-usually.trycloudflare.com`;
/**
 * Opens the Notify Me modal by appending it to the body if necessary and making it visible.
 * Ensures the modal element is added directly to the body for correct styling and display.
 * If the modal element is not found, the function exits early.
 */
function openModal() {
  /**
   * selecting the modal element
   */
  const modal = document.getElementById("notifyModal");

  if (!modal) return;

  /**
   * If the modal's parent element is not the body, remove it and add it to the body
   */
  if (modal.parentElement && modal.parentElement !== document.body) {
    modal.parentElement.removeChild(modal);
    document.body.appendChild(modal);
  }

  /**
   * showing the modal
   */
  modal.style.display = "flex";
}

/**
 * Closes the Notify Me modal and clears the email input.
 * Hides the message element in the modal by calling `hideMessage()`.
 */
function closeModal() {
  document.getElementById("notifyModal").style.display = "none";
  document.getElementsByName("email")[0].value = "";

  hideMessage();
}

/**
 * Hides the message element in the Notify Me modal by setting its display style to "none".
 */

/**
 * Hides the message element in the Notify Me modal by setting its display style to "none"
 */
function hideMessage() {
  document.getElementById("notify-message").style.display = "none";
}



/**
 * Shows a message in the Notify Me modal with a specified type and duration
 * @param {string} message - The message to show
 * @param {"success"|"error"} type - The type of message, defaults to "success"
 * @param {number} duration - The duration in milliseconds to show the message, defaults to 0
 */
function showMessage(message = "", type = "success", duration = 0) {
  const messageElement = document.getElementById("notify-message");

  setTimeout(() => {
    messageElement.style.color =
      type.toLowerCase() === "success" ? "green" : "red";
    messageElement.innerText = message;
    messageElement.style.display = "block";
  }, duration);
};


/**
 * Toggles the enable/disable state of the "Notify Me" button.
 * Adds or removes the "disabled" class and adjusts the button's disabled attribute accordingly.
 * If the button is currently disabled, it will be enabled; otherwise, it will be disabled.
 */
function toggleNotifyMeButtonEnableDisable() {
  const notifyMeButton = document.getElementById(
    "notify-me-form-submit-button",
  );
  if (notifyMeButton?.disabled) {
    notifyMeButton.classList.remove("disabled");
    notifyMeButton.disabled = false;
  } else {
    notifyMeButton.classList.add("disabled");
    notifyMeButton.disabled = true;
  }
}

/**
 * Updates the visibility of the "Notify Me" button based on the availability
 * of the selected product variant. Fetches variant details using the provided
 * variant ID from a global variable and modifies the button's display style
 * accordingly.
 *
 * @param {string} vId - The ID of the selected product variant.
 */
async function updateNotifyMeWidget(vId) {
  /**
   * fetching the variantDetails of selected variant, from global variable
   */
  const variantDetails = window.productVariants[vId];

  /**
   * checking if the variant is available, if yes, then hide the notify me button, else show it
   */
  if (!variantDetails.available) {
    document.getElementById("notify-me-subscribe-root-button").style.display =
      "block";
  } else {
    document.getElementById("notify-me-subscribe-root-button").style.display =
      "none";
  }
}

/**
 * Checks if the user is already subscribed to the product
 * @param {*} productId normalized product id
 * @param {*} variantId normalized variant id
 * @param {*} shopName  name of the store
 * @param {*} actionType name of the action
 * @returns an object with isSubscribed property, true if the user is subscribed
 */
async function isSubscribed(productId, variantId, shopName, email, actionType) {
  try {
    const response = await fetch(
    `${baseURL}/api/subscribe?productId=${productId}&variantId=${variantId}&shopName=${shopName}&email=${email}&actionType=${actionType}`.replaceAll(" ",""),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    },
  );

  return await response.json();
  } catch (error) {
    console.error("Error checking subscription status:", error);
    throw new Error(error?.message||"Failed to check subscription status");
  }
};

/**
 * Saves the subscription details to the database
 * @param {*} formData this formData contains productId, variantId, email, shopName
 */
async function saveSubscriptionDetails(formData) {
  try {
    const response = await fetch(`${baseURL}/api/subscribe`, {
    method: "POST",
    body: formData,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  
  return await response.json();
  } catch (error) {
    console.error("Error saving subscription details:", error);
    throw new Error(error.message|| "Failed to save subscription details");
  }
}

/**
 * Handles the submission of the notify me form
 * Prevents the default form submission
 * Fetches the product id, variant id, and shop name from the form container element
 * Checks if the user is already subscribed to the product
 * If yes, shows an error message
 * If not, saves the subscription details to the database
 * Shows a success message
 * If there is an error, shows an error message
 * Finally, enables the notify me button after 300ms
 * @param {Event} event - The event object
 */
async function formSubmitHandler(event) {
  try {
    event.preventDefault();

    const contianerElement = document.getElementById(
      "notify-me-subscribe-root",
    );

    const shopName = contianerElement.getAttribute("data-shop-name");
    const productId = contianerElement.getAttribute("data-product-id");
    const variantId = contianerElement.getAttribute("data-variant-id");

    const formData = new FormData(event.target);
    formData.set("productId", productId);
    formData.set("variantId", variantId);
    formData.set("shopName", shopName);

    toggleNotifyMeButtonEnableDisable();
    const res = await isSubscribed(
      productId,
      variantId,
      shopName,
      formData.get("email"),
      "subscription_status",
    );

    if (res.isSubscribed) {
      showMessage("Already subscribed", "error", 0);
      return;
    };

    if(!res.isSubscribed) {
      const res = await saveSubscriptionDetails(formData);
      showMessage(res?.message||"Subscribed successfully", "success", 0);
      return;
    }
  } catch (error) {
    showMessage(error?.message||"Subscription failed", "error", 0);
    console.error("Error while subscribing", error);
  } finally {
    setTimeout(() => {
      toggleNotifyMeButtonEnableDisable();
    }, 300);
  }
}

/**
 * Event Listeners, when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  /**
   * this part is for newer themes using variants, like 2.0 and above
   */
  document.addEventListener("variant:change", function (event) {
    const variant = event.detail.variant;
    console.log("variant changed from first listner", variant);
    if (variant) updateNotifyMeWidget(variant);
  });

  /**
   * this part is for older themes using forms
   */
  const variantForm = document.querySelector('form[action="/cart/add"]');
  if (variantForm) {
    console.log("registering form event listner");
    variantForm.addEventListener("change", function () {
      /**
       * fetching the variantId of selected variant
       */
      const selectedVariantId = this.querySelector('[name="id"]')?.value;

      if (selectedVariantId) updateNotifyMeWidget(selectedVariantId);
    });
  }

  /**
   * subscription, form handler
   */
  const notifyMeForm = document.getElementById("notify-me-form");
  /**
   * if notifyMeForm is available, then add the event listener to it, else wait for it to be available, and then add the event listener to it
   */
  if (!notifyMeForm) {
    const observer = new MutationObserver(() => {
      const notifyMeForm = document.getElementById("notify-me-form");

      if (notifyMeForm) {
        observer.disconnect();
        notifyMeForm.addEventListener("submit", formSubmitHandler);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    notifyMeForm.addEventListener("submit", formSubmitHandler);
  }
});
