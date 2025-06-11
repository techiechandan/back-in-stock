const isExtensionEnabled = () => {
  const extensionEelement = document.getElementById("restock-subscribe-root");
  return !!extensionEelement;
};

const baseURL = `https://trunk-hop-writers-ira.trycloudflare.com`

async function isSubscribed(productId, variantId, shopName) {
  const response = await fetch(
    `${baseURL}/api/subscribe?productId=${productId}&variantId=${variantId}&shopName=${shopName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return await response.json();
}





async function saveSubscriptionDetails(formData){
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
    alert(`${data.message|| "Subscription successful"}`);
    // formElement.style.display = "none";
    // messageElement.style.display = "block !important";
  }else{
    // alert(`${data.message || "Subscription failed"}`);
  }
}

async function addFormHandler() {
  // Initialize the extension
  // fetcht the form element, and add event listeners
  const formElement = document.getElementById("restock-subscribe-form");
  const contianerElement = document.getElementById("restock-subscribe-root");
  const messageElement = document.getElementById(
    "notify-message",
  );

  const shopName = contianerElement.getAttribute("data-shop-name");
  const productId = contianerElement.getAttribute("data-product-id");
  const variantId = contianerElement.getAttribute("data-variant-id");

  // check if already subscribed
  const isAlreadySubscribed = await isSubscribed(
    productId,
    variantId,
    shopName,
  );

  if (isAlreadySubscribed.isSubscribed) {
    formElement.style.display = "none";
    messageElement.style.display = "block";
    messageElement.textContent = "You have already subscribed";
  } else {
    formElement.style.display = "flex";
    messageElement.style.display = "none";
    
    
    formElement.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);

      formData.set("productId", productId);
      formData.set("variantId", variantId);
      formData.set("shopName", shopName);

      // const accessToken = formData.get('accessToken');
      await saveSubscriptionDetails(formData);
      window.location.reload();
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Subscribe for Notify extension loaded");
  if (!isExtensionEnabled()) {
    const observer = new MutationObserver(async () => {
      if (isExtensionEnabled()) {
        observer.disconnect();
        await addFormHandler();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }else{
    await addFormHandler();
  }
});
