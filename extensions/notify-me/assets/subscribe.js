const baseURL = `https://april-mass-custom-easter.trycloudflare.com`;
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

function closeModal() {
  document.getElementById("notifyModal").style.display = "none";
  document.getElementsByName("email")[0].value = "";

  hideMessage();
}

function hideMessage() {
  document.getElementById("notify-message").style.display = "none";
}

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
 *
 * @param {*} productId normalized product id
 * @param {*} variantId normalized variant id
 * @param {*} shopName  name of the store
 * @param {*} actionType name of the action
 * @returns an object with isSubscribed property, true if the user is subscribed
 */
async function isSubscribed(productId, variantId, shopName, actionType) {
  const response = await fetch(
    `${baseURL}/api/subscribe?productId=${productId}&variantId=${variantId}&shopName=${shopName}&actionType=${actionType}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    },
  );

  if (!response.ok) {
    return {
      isSubscribed: false,
    };
  }
  return await response.json();
}

/**
 *
 * @param {*} formData this formData contains productId, variantId, email, shopName
 */
async function saveSubscriptionDetails(formData) {
  const response = await fetch(`${baseURL}/api/subscribe`, {
    method: "POST",
    body: formData,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  const messageElement = document.getElementById("notify-message");
  const formElement = document.getElementById("restock-subscribe-form");

  if (data.success) {
    alert(`${data.message || "Subscription successful"}`);
  } else {
    // alert(`${data.message || "Subscription failed"}`);
  }
}

async function formSubmitHandler(event) {
  try {
    event.preventDefault();

    const contianerElement = document.getElementById(
      "notify-me-subscribe-root",
    );

    const messageElement = document.getElementById("notify-message");

    const shopName = contianerElement.getAttribute("data-shop-name");
    const productId = contianerElement.getAttribute("data-product-id");
    const variantId = contianerElement.getAttribute("data-variant-id");

    const formData = new FormData(event.target);
    formData.set("productId", productId);
    formData.set("variantId", variantId);
    formData.set("shopName", shopName);
    // formData.set("email", formData.get("email"));
    // formData.set("actionType", "stock_status");

    toggleNotifyMeButtonEnableDisable();
    const res = await isSubscribed(
      productId,
      variantId,
      shopName,
      "subscription_status",
    );

    if (res.isSubscribed) {
      messageElement.style.color = "red";
      messageElement.innerText = "You have already subscribed";
      messageElement.style.display = "block";
      return;
    } else {
      await saveSubscriptionDetails(formData);
    }
  } catch (error) {
    console.error("Error while subscribing",error)
  } finally {
    setTimeout(()=>{
      toggleNotifyMeButtonEnableDisable();
    },300);
  }
}

/**
 * Event Listeners
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
