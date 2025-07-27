// DOM Elements
const sidebar = document.getElementById("sidebar")
const menuToggle = document.getElementById("menu-toggle")
const closeSidebar = document.getElementById("close-sidebar")
const chatBox = document.getElementById("chat-box")
const userInput = document.getElementById("user-input")
const sendBtn = document.getElementById("send-btn")
const stopBtn = document.getElementById("stop-btn")
const settingsBtn = document.getElementById("settings-btn")
const uploadImageBtn = document.getElementById("upload-image-btn")
const weatherBtn = document.getElementById("weather-btn")
const voiceInputBtn = document.getElementById("voice-input-btn")
const imageUploadModal = document.getElementById("image-upload-modal")
const weatherModal = document.getElementById("weather-modal")
const settingsModal = document.getElementById("settings-modal")
const uploadArea = document.getElementById("upload-area")
const imageInput = document.getElementById("image-input")
const imagePreview = document.getElementById("image-preview")
const previewImg = document.getElementById("preview-img")
const weatherCity = document.getElementById("weather-city")
const getWeatherBtn = document.getElementById("get-weather-btn")
const weatherResults = document.getElementById("weather-results")
const recentChatsList = document.getElementById("recent-chats-list")
const currentChatTitle = document.getElementById("current-chat-title")
const newChatBtn = document.getElementById("new-chat-btn")
const logoBtn = document.getElementById("logo-btn")
const mainContent = document.getElementById("main-content")

// DOM Elements - Add new elements
const inputImagePreview = document.getElementById("input-image-preview")
const inputPreviewImg = document.getElementById("input-preview-img")
const removeInputImage = document.getElementById("remove-input-image")
const uploadProgress = document.getElementById("upload-progress")
const settingsTabs = document.querySelectorAll(".settings-tab")
const settingsContents = document.querySelectorAll(".settings-content")
const fillTemplateBtn = document.getElementById("fill-template")
const personalizationTemplate = document.getElementById("personalization-template")
const clearDataBtn = document.getElementById("clear-data")

// Theme and UI Settings
const themeButtons = document.querySelectorAll(".theme-btn")
const aiTone = document.getElementById("ai-tone")
const soundToggle = document.getElementById("sound-toggle")
const weatherAlerts = document.getElementById("weather-alerts")
const userName = document.getElementById("user-name")
const userRole = document.getElementById("user-role")
const saveHistory = document.getElementById("save-history")
const saveImages = document.getElementById("save-images")
const personalizedSuggestions = document.getElementById("personalized-suggestions")
const secureConnection = document.getElementById("secure-connection")
const autoLogout = document.getElementById("auto-logout")

// State Management
let isTyping = false
const currentTheme = "dark"
let chatCounter = 1
let chats = [{ id: "chat-1", title: "New Chat", messages: [] }]
let currentChatId = "chat-1"
let isSidebarOpen = true
const notificationSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3")

// State Management - Add new state variables
let isProcessing = false
let uploadedImage = null
let progressCircle = null
let isRecording = false

// Add these variables at the top with other state variables
let uploadedImageFilename = null


// Add these variables at the top with your other DOM elements
const textToSpeechBtn = document.getElementById('text-to-speech-btn');
let isSpeaking = false;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;



// function speakText(text) {
//   if (!isSpeaking) return;

//   if (speechSynthesis.speaking) {
//     speechSynthesis.cancel();
//   }

//   const utterance = new SpeechSynthesisUtterance(text);
//   const selectedLangCode = document.getElementById("language-select").value;

//   // Set language for speech
//   utterance.lang = selectedLangCode;

//   // Select a matching voice
//   const voices = speechSynthesis.getVoices();
//   const matchingVoice = voices.find(voice => voice.lang === selectedLangCode);
//   if (matchingVoice) {
//     utterance.voice = matchingVoice;
//   } else {
//     console.warn(`No voice found for language: ${selectedLangCode}. Falling back to default.`);
//     utterance.lang = 'en-US'; // Fallback to English
//   }

//   utterance.rate = 1.0;
//   utterance.pitch = 1.0;

//   currentUtterance = utterance;
//   utterance.onend = function () {
//     if (currentUtterance === utterance) {
//       currentUtterance = null;
//     }
//   };

//   speechSynthesis.speak(utterance);
// }

// Toggle text-to-speech function
let currentAudio = null;
function speakText(text) {
  if (!isSpeaking) return;

  const selectedLangCode = document.getElementById("language-select").value;

  fetch('/text-to-speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: text, lang: selectedLangCode })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('TTS request failed');
    }
    return response.blob();
  })
  .then(audioBlob => {
    const audioUrl = URL.createObjectURL(audioBlob);
  
    // Stop current audio if playing
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  
    // Play new audio
    currentAudio = new Audio(audioUrl);
    currentAudio.play();
  })
  .catch(error => {
    console.error('Error with TTS:', error);
  });
}


function toggleTextToSpeech() {
  isSpeaking = !isSpeaking;
  
  if (isSpeaking) {
    // Activate the button
    textToSpeechBtn.classList.add('active');
    // We don't speak anything when first activated
  } else {
    // Deactivate the button
    textToSpeechBtn.classList.remove('active');
    
    // Stop speaking if something is being spoken
    // if (speechSynthesis.speaking) {
    //   speechSynthesis.cancel();
    //   currentUtterance = null;
    // }

    if (currentAudio) {
      currentAudio.src = '';
      currentAudio.load();
      currentAudio = null;
    }
    

  }
}




// Stop speaking when the page is unloaded
// window.addEventListener('beforeunload', function() {
//   if (speechSynthesis && speechSynthesis.speaking) {
//     speechSynthesis.cancel();
//   }
// });

window.addEventListener('beforeunload', function () {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
});


// Declare setTheme and setActiveButton functions
function setTheme(theme) {
  // Remove existing theme classes
  document.body.classList.remove("theme-light", "theme-dark");

  // If 'theme' is 'system', check the system's theme preference
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    theme = systemTheme; // Set the theme to either 'dark' or 'light' based on the system's preference
  }

  // Add the new theme class
  document.body.classList.add(`theme-${theme}`);

  // Store the theme preference in localStorage
  localStorage.setItem("theme", theme);
}



function setActiveButton(buttonGroup, activeButton) {
  buttonGroup.forEach((btn) => btn.classList.remove("active"))
  activeButton.classList.add("active")
}

// Declare Swal if it's not already available
if (typeof Swal === "undefined") {
  window.Swal = {
    fire: (options) => {
      alert(options.title + "\n" + options.text)
    },
    close: () => { },
    showLoading: () => { },
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      if (btn.dataset.theme === savedTheme) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    setTheme("light");
  } else {
    setTheme("dark");
  }

  // Check for saved language preference
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en"; // Default to English
  changeLanguage(savedLanguage); // Set the language
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.value = savedLanguage; // Update the dropdown
  }

  // Set up event listeners
  setupEventListeners();

  // Update chat count
  updateChatCount();

  // Initialize progress circle
  initProgressCircle();

  // Add welcome message
  setTimeout(() => {
    const selectedLangCode = document.getElementById("language-select").value; // Get the selected language code
    const welcomeMessages = {
      en: "Hello! I'm KrushiGPT, your agricultural assistant. How can I help you today?",
      hi: "नमस्ते! मैं KrushiGPT हूँ, आपका कृषि सहायक। मैं आपकी कैसे मदद कर सकता हूँ?",
      mr: "नमस्कार! मी KrushiGPT आहे, तुमचा कृषी सहाय्यक. मी तुम्हाला कशात मदत करू शकतो?",
      gu: "નમસ્તે! હું KrushiGPT છું, તમારું કૃષિ સહાયક. હું તમને કેવી રીતે મદદ કરી શકું?",
      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ KrushiGPT ਹਾਂ, ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
      te: "హలో! నేను KrushiGPT, మీ వ్యవసాయ సహాయకుడు. నేను మీకు ఎలా సహాయం చేయగలను?",
      ta: "வணக்கம்! நான் KrushiGPT, உங்கள் வேளாண்மை உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      fr: "Bonjour! Je suis KrushiGPT, votre assistant agricole. Comment puis-je vous aider aujourd'hui?",
      es: "¡Hola! Soy KrushiGPT, tu asistente agrícola. ¿Cómo puedo ayudarte hoy?",
      de: "Hallo! Ich bin KrushiGPT, Ihr landwirtschaftlicher Assistent. Wie kann ich Ihnen heute helfen?",
      zh: "你好！我是KrushiGPT，您的农业助手。我今天能帮您什么忙？",
      ja: "こんにちは！私はKrushiGPTです。農業アシスタントです。今日はどのようにお手伝いできますか？",
      ar: "مرحبًا! أنا KrushiGPT، مساعدك الزراعي. كيف يمكنني مساعدتك اليوم؟"
    };
  
    // Get the welcome message in the selected language, default to English if not found
    const welcomeMessage = welcomeMessages[selectedLangCode] || welcomeMessages["en"];
    addBotMessage(welcomeMessage);
  }, 800);

  // Load Google Translate script
  loadGoogleTranslate();
});

// Initialize progress circle
function initProgressCircle() {
  progressCircle = document.querySelector(".progress-ring-circle")
  const radius = progressCircle.r.baseVal.value
  const circumference = 2 * Math.PI * radius

  progressCircle.style.strokeDasharray = `${circumference} ${circumference}`
  progressCircle.style.strokeDashoffset = circumference
}

// Set progress percentage for circle
function setProgress(percent) {
  if (!progressCircle) return

  const radius = progressCircle.r.baseVal.value
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  progressCircle.style.strokeDashoffset = offset
}

// Set up all event listeners
function setupEventListeners() {
  // Sidebar toggle with animation
  menuToggle.addEventListener("click", () => {
    toggleSidebar(true);
  });

  if (textToSpeechBtn) {
    textToSpeechBtn.addEventListener('click', toggleTextToSpeech);
  }

  closeSidebar.addEventListener("click", () => {
    toggleSidebar(false);
  });

  // Send message on Enter, add new line on Shift+Enter
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior of adding a new line
      sendMessage(); // Call the sendMessage function
    }
  });

  // Add event listener for the Send button
  sendBtn.addEventListener("click", sendMessage);

  // Modal controls
  uploadImageBtn.addEventListener("click", () => {
    imageInput.click();
  });
  weatherBtn.addEventListener("click", () => toggleModal(weatherModal));
  settingsBtn.addEventListener("click", () => toggleModal(settingsModal));

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      toggleModal(modal, false);
    });
  });

  // Image upload - Modified for inline preview
  imageInput.addEventListener("change", handleImageUpload);
  removeInputImage.addEventListener("click", removeUploadedImage);

  document.querySelector(".cancel-upload").addEventListener("click", () => {
    resetImageUpload();
    toggleModal(imageUploadModal, false);
  });

  document.getElementById("upload-btn").addEventListener("click", uploadImage);

  // Weather
  getWeatherBtn.addEventListener("click", getWeather);

  // Theme settings
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      setTheme(theme);
      setActiveButton(themeButtons, btn);
    });
  });

  // New Chat
  newChatBtn.addEventListener("click", createNewChat);
  logoBtn.addEventListener("click", createNewChat);

  // Voice input with enhanced UI
  voiceInputBtn.addEventListener("click", () => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  });

  // Settings tabs
  settingsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      switchSettingsTab(tabId);
    });
  });

  // Fill template button
  fillTemplateBtn.addEventListener("click", fillPersonalizationTemplate);

  // Clear data button
  clearDataBtn.addEventListener("click", confirmClearData);

  // Handle clicks outside modals
  document.addEventListener("click", (e) => {
    const modals = document.querySelectorAll(".modal.active");
    modals.forEach((modal) => {
      if (e.target === modal) {
        toggleModal(modal, false);
      }
    });
  });

  // Add input event listener to adjust textarea height
  userInput.addEventListener("input", adjustTextareaHeight);

  // Add focus event listener to adjust height when focused
  userInput.addEventListener("focus", adjustTextareaHeight);

  // Language selection change
  document.getElementById("language-select").addEventListener("change", (event) => {
    const selectedLangCode = event.target.value;
    createNewChat();
    changeLanguage(selectedLangCode);
  });
}

// Toggle sidebar with animation
function toggleSidebar(show) {
  isSidebarOpen = show

  if (show) {
    sidebar.classList.add("active")
  } else {
    sidebar.classList.remove("active")
  }

  // Always reset the margin regardless of device size
  mainContent.style.marginLeft = "0"
}

// Switch settings tab
function switchSettingsTab(tabId) {
  // Remove active class from all tabs and contents
  settingsTabs.forEach((tab) => tab.classList.remove("active"))
  settingsContents.forEach((content) => content.classList.remove("active"))

  // Add active class to selected tab and content
  document.querySelector(`.settings-tab[data-tab="${tabId}"]`).classList.add("active")
  document.getElementById(`${tabId}-content`).classList.add("active")
}

// Fill personalization template
function fillPersonalizationTemplate() {
  const name = userName.value || "User"
  const role = userRole.options[userRole.selectedIndex].text

  const template = `Please address me as ${name}. I am a ${role} and prefer information that is practical and applicable to my work. I'm interested in sustainable farming practices and need advice that considers my expertise level.`

  personalizationTemplate.value = template
  personalizationTemplate.focus()
}

// Confirm clear data
function confirmClearData() {
  if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
    // Clear chats
    chats = [{ id: "chat-1", title: "New Chat", messages: [] }]
    currentChatId = "chat-1"

    // Clear UI
    recentChatsList.innerHTML = `<li class="active" data-chat-id="chat-1"><i class="fas fa-comment"></i> New Chat</li>`
    chatBox.innerHTML = ""

    // Update chat count
    updateChatCount()

    // Show confirmation
    Swal.fire({
      position: 'top-end',
      title: "Data Cleared",
      text: "All your data has been successfully cleared.",
      icon: "success",
      toast: true,
      showConfirmButton: false,
      timer: 1500
    })
  }
}

// Update handleImageUpload to directly show the image beside input without popup
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: "Please select an image file",
      toast: true,
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  // Show the image preview immediately
  const reader = new FileReader();
  reader.onload = (event) => {
    inputPreviewImg.src = event.target.result;
    inputImagePreview.classList.add("active"); // Show the preview container
  };
  reader.readAsDataURL(file);

  // Show the loader immediately
  uploadProgress.classList.add("active");
  setProgress(0); // Reset progress to 0%

  // Fake progress animation
  let fakeProgress = 0;
  const progressInterval = setInterval(() => {
    if (fakeProgress < 90) {
      fakeProgress += 10; // Increment progress by 10%
      setProgress(fakeProgress);
    }
  }, 500); // Update every 500ms

  // Create form data for upload
  const formData = new FormData();
  formData.append("image", file);

  // Get selected language
  const selectedLang = document.getElementById("language-select").value;
  formData.append("language", selectedLang);
  formData.append("message", ""); // Empty message initially

  // Upload the image to the server
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      // Complete progress animation
      clearInterval(progressInterval); // Stop the fake progress
      setProgress(100); // Set progress to 100%

      if (data.filename) {
        // Save the filename for later use
        uploadedImageFilename = data.filename;
        uploadedImage = `/static/uploads/${data.filename}`; // Construct the image URL

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: "Your image has been uploaded.",
          toast: true,
          showConfirmButton: false,
          timer: 1500
        });

        // Optionally, you can use the image URL (uploadedImage) for further processing
        console.log("Uploaded image URL:", uploadedImage);

      } else {
        // Image not related to agriculture
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: data.message,
          toast: true,
          showConfirmButton: false,
          timer: 1500
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      clearInterval(progressInterval); // Stop the fake progress
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: "There was an error uploading your image.",
        toast: true,
        showConfirmButton: false,
        timer: 1500
      });
    })
    .finally(() => {
      // Remove the loader after processing is complete
      setTimeout(() => {
        uploadProgress.classList.remove("active");
      }, 500);
    });
}


// Remove uploaded image from input
function removeUploadedImage() {
  if (uploadedImageFilename) {
    // Send a request to delete the file from the server
    fetch("/delete-upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: uploadedImageFilename }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message); // Log success or error message
      })
      .catch((error) => {
        console.error("Error deleting file:", error);
      });
  }

  // Remove the preview and reset variables
  inputImagePreview.classList.remove("active");
  inputPreviewImg.src = "";
  uploadedImage = null;
  uploadedImageFilename = null;
  imageInput.value = "";
}

// Create a new chat
function createNewChat() {
  chatCounter++
  const chatId = `chat-${chatCounter}`
  const chatTitle = `New Chat ${chatCounter > 1 ? chatCounter : ""}`

  // Add to chats array
  chats.push({
    id: chatId,
    title: chatTitle,
    messages: [],
  })

  // Add to sidebar
  addChatToSidebar(chatId, chatTitle)

  // Switch to new chat
  switchChat(chatId)

  // Update chat count
  updateChatCount()

  // Play notification sound if enabled and user has interacted with the page
  if (soundToggle.checked && document.body.classList.contains('user-interacted')) {
    notificationSound.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });
  }

  // Clear chat and add welcome message
  chatBox.innerHTML = ""
    const selectedLangCode = document.getElementById("language-select").value; // Get the selected language code
  const welcomeMessages = {
    en: "Hello! I'm KrushiGPT, your agricultural assistant. How can I help you today?",
    hi: "नमस्ते! मैं KrushiGPT हूँ, आपका कृषि सहायक। मैं आपकी कैसे मदद कर सकता हूँ?",
    mr: "नमस्कार! मी KrushiGPT आहे, तुमचा कृषी सहाय्यक. मी तुम्हाला कशात मदत करू शकतो?",
    gu: "નમસ્તે! હું KrushiGPT છું, તમારું કૃષિ સહાયક. હું તમને કેવી રીતે મદદ કરી શકું?",
    pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ KrushiGPT ਹਾਂ, ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    te: "హలో! నేను KrushiGPT, మీ వ్యవసాయ సహాయకుడు. నేను మీకు ఎలా సహాయం చేయగలను?",
    ta: "வணக்கம்! நான் KrushiGPT, உங்கள் வேளாண்மை உதவியாளர். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    fr: "Bonjour! Je suis KrushiGPT, votre assistant agricole. Comment puis-je vous aider aujourd'hui?",
    es: "¡Hola! Soy KrushiGPT, tu asistente agrícola. ¿Cómo puedo ayudarte hoy?",
    de: "Hallo! Ich bin KrushiGPT, Ihr landwirtschaftlicher Assistent. Wie kann ich Ihnen heute helfen?",
    zh: "你好！我是KrushiGPT，您的农业助手。我今天能帮您什么忙？",
    ja: "こんにちは！私はKrushiGPTです。農業アシスタントです。今日はどのようにお手伝いできますか？",
    ar: "مرحبًا! أنا KrushiGPT، مساعدك الزراعي. كيف يمكنني مساعدتك اليوم؟"
  };

  // Get the welcome message in the selected language, default to English if not found
  const welcomeMessage = welcomeMessages[selectedLangCode] || welcomeMessages["en"];
  addBotMessage(welcomeMessage);
}

// Add chat to sidebar
function addChatToSidebar(chatId, chatTitle) {
  const li = document.createElement("li")
  li.dataset.chatId = chatId
  li.innerHTML = `
    <i class="fas fa-comment"></i>
    <span>${chatTitle}</span>
    <button class="delete-chat" title="Delete Chat">
      <i class="fas fa-times"></i>
    </button>
  `

  // Add click event to switch to this chat
  li.addEventListener("click", (e) => {
    if (!e.target.closest(".delete-chat")) {
      switchChat(chatId)
    }
  })

  // Add delete button event
  const deleteBtn = li.querySelector(".delete-chat")
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    deleteChat(chatId)
  })

  recentChatsList.appendChild(li)
}

// Switch to a different chat
function switchChat(chatId) {
  // Update current chat ID
  currentChatId = chatId

  // Find the chat in the array
  const chat = chats.find((c) => c.id === chatId)

  // Update chat title
  currentChatTitle.textContent = chat.title

  // Update active class in sidebar
  const chatItems = recentChatsList.querySelectorAll("li")
  chatItems.forEach((item) => {
    if (item.dataset.chatId === chatId) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    sidebar.classList.remove("active")
  }
}

// Delete a chat
function deleteChat(chatId) {
  // Use SweetAlert2 for confirmation
  Swal.fire({
    title: "Are you sure?",
    text: "This chat will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#4CAF50",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      // Remove from chats array
      chats = chats.filter((c) => c.id !== chatId);

      // Remove from sidebar
      const chatItem = recentChatsList.querySelector(`li[data-chat-id="${chatId}"]`);
      if (chatItem) {
        chatItem.remove();
      }

      // If current chat was deleted, switch to first available chat
      if (currentChatId === chatId && chats.length > 0) {
        switchChat(chats[0].id);
      }

      // Update chat count
      updateChatCount();

      // Show success message
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Chat deleted successfully.",
        toast: true,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
}

// Update chat count
function updateChatCount() {
  const chatCountEl = document.querySelector(".recent-chats h3")
  chatCountEl.setAttribute("data-count", chats.length)
}

let chatHistory = [];
// Update sendMessage function to handle chat history
function sendMessage() {
  const message = userInput.value.trim();
  if ((message === "" && !uploadedImage) || isProcessing) return;

  // Change send button to stop button
  isProcessing = true;
  sendBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");

  // Add user message to chat with image if present
  if (uploadedImage) {
    addUserMessageWithImage(message, uploadedImage);
    inputImagePreview.classList.remove("active");
  } else {
    addUserMessage(message);
  }

  userInput.value = "";
  // Reset textarea height
  adjustTextareaHeight();

  // Show typing indicator
  showTypingIndicator();

  // Get selected language and map it to the full language name
  const selectedLangCode = document.getElementById("language-select").value;
  const selectedLangName = languageMap[selectedLangCode] || "English"; // Default to English if not found

  // Prepare chat history
  const chatHistory = [];  // Initialize chat history

  // If an image URL is present, call the image processing endpoint
  if (uploadedImageFilename) {
    fetch("/image-processing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: uploadedImageFilename,
        message: message,
        language: selectedLangName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        hideTypingIndicator();
        addBotMessage(data.message); // Display the response from the image processing
        speakText(data.message); // Speak the response

        // Switch back to the send button
        stopBtn.classList.add("hidden");
        sendBtn.classList.remove("hidden");
        isProcessing = false;

        // Update chat history
        chatHistory.push({
          user: message,
          bot: data.message,
        });

        // Reset uploaded image filename
        resetImageUpload();
      })
      .catch((error) => {
        console.error("Error:", error);
        hideTypingIndicator();
        addBotMessage("Sorry, there was an error processing your image. Please try again.");

        // Switch back to the send button
        stopBtn.classList.add("hidden");
        sendBtn.classList.remove("hidden");
        isProcessing = false;
      });
  } else {
    // If no image, call the chat endpoint
    fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        language: selectedLangName, // Pass the full language name
        history: chatHistory, // Pass the current chat history to the backend
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        hideTypingIndicator();
        addBotMessage(data.reply); // Display the response from the chat
        speakText(data.reply); // Speak the response

        // Update chat history with the latest conversation
        if (data.history && Array.isArray(data.history)) {
          updateChatHistory(data.history);
        }

        // Switch back to the send button
        stopBtn.classList.add("hidden");
        sendBtn.classList.remove("hidden");
        isProcessing = false;
      })
      .catch((error) => {
        console.error("Error:", error);
        hideTypingIndicator();
        addBotMessage("Sorry, there was an error processing your request. Please try again.");

        // Switch back to the send button
        stopBtn.classList.add("hidden");
        sendBtn.classList.remove("hidden");
        isProcessing = false;
      });
  }
}



// Add a new function to update chat history from the server
function updateChatHistory(history) {
  // Find the current chat
  const chat = chats.find((c) => c.id === currentChatId);
  if (!chat) return;

  // Only clear existing messages if we have a full history
  if (history.length > 0) {
    chat.messages = []; // This resets the chat history to avoid duplicates
  }

  // Add each message from history to the local chat
  history.forEach((entry) => {
    if (entry.user) {
      chat.messages.push({
        role: "user",
        content: entry.user,
        timestamp: new Date(), // Use provided timestamp or current time
      });
    }
    if (entry.bot) {
      chat.messages.push({
        role: "assistant",
        content: entry.bot,
        timestamp: new Date(), // Use provided timestamp or current time
      });
    }
  });
}



// Add user message to chat
function addUserMessage(message) {
  const now = new Date()
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const messageElement = document.createElement("div")
  messageElement.className = "chat-message user-message"
  messageElement.innerHTML = `
    <div class="message-bubble">
      ${message}
      <div class="message-time">${timeString}</div>
    </div>
  `
  chatBox.appendChild(messageElement)
  chatBox.scrollTop = chatBox.scrollHeight
}


// Add user message with image to chat
function addUserMessageWithImage(message, imageUrl) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const messageElement = document.createElement("div");
  messageElement.className = "chat-message user-message";

  // Create message content with image
  let messageContent = `<img src="${imageUrl}" class="message-image-small" alt="Uploaded image">`;
  if (message) {
    messageContent += `<div>${message}</div>`;
  }

  messageElement.innerHTML = `
    <div class="message-bubble">
      ${messageContent}
      <div class="message-time">${timeString}</div>
    </div>
  `;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Add bot message to chat
// New formatting function
function formatBotMessage(message) {
  // 1. Bold headings like **Heading**
  message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 2. Bullet points for lines starting with '* '
  message = message.replace(/\* /g, '<br>\u2022 '); // Unicode for • symbol

  // 3. Remove any extra * (if any)
  message = message.replace(/\*/g, '');

  return message.trim();
}

// Updated addBotMessage
function addBotMessage(message, saveToChat = true) {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 🛠 Format the incoming bot message
  const formattedMessage = formatBotMessage(message);

  const messageElement = document.createElement("div");
  messageElement.className = "chat-message bot-message";
  messageElement.innerHTML = `
    <div class="message-bubble">
      ${formattedMessage}
      <div class="message-time">${timeString}</div>
    </div>
  `;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Play notification sound if enabled and user has interacted with the page
  if (soundToggle.checked && document.body.classList.contains('user-interacted')) {
    notificationSound.play().catch((error) => {
      //console.warn("Audio playback failed:", error);
    });
  }

  // Save message to current chat
  if (saveToChat && saveHistory.checked) {
    const chat = chats.find((c) => c.id === currentChatId);
    if (chat) {
      chat.messages.push({
        role: "assistant",
        content: message,  // Note: original message saved
        timestamp: now,
      });
    }
  }
}


// Show typing indicator
function showTypingIndicator() {
  isTyping = true
  const typingElement = document.createElement("div")
  typingElement.className = "typing-indicator"
  typingElement.id = "typing-indicator"
  typingElement.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `
  chatBox.appendChild(typingElement)
  chatBox.scrollTop = chatBox.scrollHeight
}

// Hide typing indicator
function hideTypingIndicator() {
  isTyping = false
  const typingElement = document.getElementById("typing-indicator")
  if (typingElement) {
    typingElement.remove()
  }
}

// Toggle modal visibility
function toggleModal(modal, show = true) {
  if (show) {
    modal.classList.add("active")
  } else {
    modal.classList.remove("active")
  }
}

// Preview uploaded image
function previewImage(e) {
  const file = e.target.files[0]
  if (!file) return

  if (!file.type.match("image.*")) {
    Swal.fire({
      title: "Error!",
      text: "Please select an image file",
      icon: "error",
      confirmButtonColor: "#4CAF50",
    })
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    previewImg.src = e.target.result
    uploadArea.style.display = "none"
    imagePreview.style.display = "block"
  }
  reader.readAsDataURL(file)
}

// Reset image upload
function resetImageUpload() {
  imageInput.value = ""
  previewImg.src = ""
  uploadArea.style.display = "block"
  imagePreview.style.display = "none"
  uploadedImageFilename = null
  uploadedImage = null
}

// Upload and analyze image
function uploadImage() {
  const file = imageInput.files[0]
  if (!file) {
    Swal.fire({
      title: "Error!",
      text: "Please select an image first",
      icon: "error",
      confirmButtonColor: "#4CAF50",
    })
    return
  }

  // Show loading state
  Swal.fire({
    title: "Analyzing Image...",
    text: "Please wait while we process your image",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })

  // Simulate upload and analysis (replace with actual API call)
  setTimeout(() => {
    Swal.close()
    toggleModal(imageUploadModal, false)

    // Create image element for chat
    const reader = new FileReader()
    reader.onload = (e) => {
      // Add image to chat
      const messageElement = document.createElement("div")
      messageElement.className = "chat-message user-message"
      messageElement.innerHTML = `
        <div class="message-bubble">
          <div>Image uploaded for analysis</div>
          <img src="${e.target.result}" class="message-image" alt="Uploaded image">
          <div class="message-time">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      `
      chatBox.appendChild(messageElement)

      // Save to chat history
      if (saveHistory.checked && saveImages.checked) {
        const chat = chats.find((c) => c.id === currentChatId)
        if (chat) {
          chat.messages.push({
            role: "user",
            content: `<img src="${e.target.result}" class="message-image" alt="Uploaded image">`,
            timestamp: new Date(),
          })
        }
      }

      // Show typing indicator
      showTypingIndicator()

      // Simulate analysis
      setTimeout(() => {
        hideTypingIndicator()

        // Add response to chat
        addBotMessage(`
          <p>I've analyzed your image and detected signs of <strong>leaf blight</strong>, which is common in many crops.</p>
          <p>Recommendations:</p>
          <ul>
            <li>Apply a copper-based fungicide as soon as possible</li>
            <li>Ensure proper spacing between plants for better air circulation</li>
            <li>Remove and destroy infected plant parts</li>
            <li>Avoid overhead irrigation to reduce leaf wetness</li>
          </ul>
          <p>Would you like more specific treatment options?</p>
        `)
      }, 2000)

      resetImageUpload()
    }
    reader.readAsDataURL(file)
  }, 2000)
}

// Get weather information
function getWeather() {
  const city = weatherCity.value.trim()
  if (city === "") {
    Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: "Please enter a city name",
      toast: true,
      showConfirmButton: false,
      timer: 1500
    });
    return
  }

  // Show loading state
  weatherResults.innerHTML = "<p>Loading weather information...</p>"

  // Get selected language
  const selectedLang = document.getElementById("language-select").value

  // Call the weather API
  fetch(`/weather?city=${encodeURIComponent(city)}&lang=${selectedLang}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        weatherResults.innerHTML = `<p>Error: ${data.error}</p>`
        return
      }

      // Update weather results
      weatherResults.innerHTML = `
        <div class="weather-card">
          <div class="weather-icon">${getWeatherIcon(data.description)}</div>
          <div class="weather-temp">${Math.round(data.temperature)}°C</div>
          <div class="weather-desc">${data.description} in ${data.location}</div>
          <div class="weather-details">
            <div class="weather-detail">
              <span class="weather-detail-label">Humidity</span>
              <span class="weather-detail-value">${data.humidity}%</span>
            </div>
            <div class="weather-detail">
              <span class="weather-detail-label">Wind</span>
              <span class="weather-detail-value">${data.wind_speed} km/h</span>
            </div>
          </div>
        </div>
      `

      // Add weather info to chat
      toggleModal(weatherModal, false)
      addBotMessage(`
        <div class="weather-info">
          <p>Here's the current weather in ${data.location}:</p>
          <p><strong>${Math.round(data.temperature)}°C</strong>, ${data.description}</p>
          <p>Humidity: ${data.humidity}% | Wind: ${data.wind_speed} km/h</p>
        </div>
      `)
    })
    .catch((error) => {
      console.error("Error:", error)
      weatherResults.innerHTML = "<p>Failed to fetch weather information. Please try again.</p>"
    })
}

// Helper function to get weather icon
function getWeatherIcon(description) {
  const desc = description.toLowerCase()
  if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️"
  if (desc.includes("cloud")) return "☁️"
  if (desc.includes("clear")) return "☀️"
  if (desc.includes("sun")) return "☀️"
  if (desc.includes("snow")) return "❄️"
  if (desc.includes("thunder") || desc.includes("storm")) return "⛈️"
  if (desc.includes("fog") || desc.includes("mist")) return "🌫️"
  return "⛅" // Default
}

// Updated voice input functions

// Declare globals for recognition and transcript
let recognition = null;
let voiceTranscript = "";

function startVoiceInput() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Get the user-selected language from the dropdown
    const selectedLangCode = document.getElementById("language-select").value;
    recognition.lang = selectedLangCode; // Set the recognition language dynamically

    recognition.interimResults = true;
    recognition.continuous = false; // Use non-continuous mode so that silence ends recognition automatically
    voiceInputBtn.classList.add("recording");
    isRecording = true;
    voiceTranscript = "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interimTranscript += event.results[i][0].transcript;
      }
      voiceTranscript = interimTranscript;
      // Update UI to show transcript in the input field (optional)
      userInput.value = voiceTranscript;
      adjustTextareaHeight();
    };

    recognition.onend = () => {
      voiceInputBtn.classList.remove("recording");
      isRecording = false;
      if (voiceTranscript.trim() !== "") {
        // Set the final transcript and send the message automatically
        userInput.value = voiceTranscript.trim();
        sendMessage();
        userInput.value = "";
        voiceTranscript = "";
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      stopVoiceInput();
    };

    recognition.start();
  } else {
    Swal.fire({
      icon: "error",
      title: "Speech Recognition Not Supported",
      text: "Your browser doesn't support speech recognition. Please try another browser like Google Chrome.",
      confirmButtonColor: "#4CAF50",
    });
  }
}

function stopVoiceInput() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  voiceInputBtn.classList.remove("recording");
  isRecording = false;
}

// Add a function to adjust textarea height dynamically
function adjustTextareaHeight() {
  // Determine the minimum height based on screen size
  const isMobile = window.innerWidth <= 768;
  const minHeight = isMobile ? 70 : 150; // 70px for mobile, 150px for larger screens

  // Reset height to minimum before recalculating
  userInput.style.height = `${minHeight}px`;

  // Check if the textarea is empty
  if (userInput.value === "") {
    // If empty, reset to the minimum height
    userInput.style.height = `${minHeight}px`;
    return;
  }

  // Calculate the new height based on content
  const scrollHeight = userInput.scrollHeight;
  const maxHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--max-textarea-height")
  );

  // Set the height to the content's scrollHeight, but cap it at maxHeight
  const newHeight = Math.min(scrollHeight, maxHeight);
  userInput.style.height = `${Math.max(newHeight, minHeight)}px`;

  // If content exceeds maxHeight, ensure the textarea scrolls to the bottom
  if (scrollHeight > maxHeight) {
    userInput.scrollTop = userInput.scrollHeight;
  }
}

// Add a listener to mark the page as interacted
document.addEventListener('click', () => {
  document.body.classList.add('user-interacted');
}, { once: true });

// Map of language codes to full language names
const languageMap = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  pa: "Punjabi",
  te: "Telugu",
  ta: "Tamil",
  fr: "French",
  es: "Spanish",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ar: "Arabic"
};

// Function to change the UI language and send the full language name
function changeLanguage(lang) {
  const fullLanguageName = languageMap[lang] || "English"; // Default to English if not found

  // Update the Google Translate widget
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = lang; // Set the selected language code
    combo.dispatchEvent(new Event('change')); // Trigger the change event
  }

  // Store the selected language in localStorage
  localStorage.setItem("selectedLanguage", lang);

  // Update the UI to reflect the selected language
  const languageSelect = document.getElementById("language-select");
  
  if (languageSelect) {
    languageSelect.value = lang; // Update the dropdown
  }

  console.log(`Language changed to: ${fullLanguageName}`);
}

// Function to dynamically load the Google Translate script
function loadGoogleTranslate() {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(script);
}

// Initialize Google Translate
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi,mr,gu,pa,te,ta,fr,es,de,zh,ja,ar',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
}


// Function to delete all uploads on page refresh
function deleteAllUploadsOnRefresh() {
  fetch("/delete-all-uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      //console.log(data.message); // Log success or error message
    })
    .catch((error) => {
      //console.error("Error deleting uploads:", error);
    });
}

// Call the function when the page is refreshed
window.addEventListener("beforeunload", () => {
  deleteAllUploadsOnRefresh();
});
