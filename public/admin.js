const Message = {
  hasNewImage: false,
};

$(".select").click(function () {
  Message.hasNewImage = false;
  $(".card-container").addClass("hide");
  $(".message-container").removeClass("hide");
  $("#save-cta").removeClass("hide");
  $(".hero-image").attr("src", $(this).find(".card-image").attr("src"));
  $(".hero-image").removeClass("hide");
  $(".add-image").addClass("hide");
});

$(".add").click(function () {
  Message.hasNewImage = true;
  $(".card-container").addClass("hide");
  $(".message-container").removeClass("hide");
  $(".hero-image").addClass("hide");
  $(".add-image").removeClass("hide");
});

function readURL(input) {
  if (input.files && input.files[0]) {
    let reader = new FileReader();

    reader.onload = function (e) {
      $(".hero-image").attr("src", e.target.result);
      $(".hero-image").removeClass("hide");
      $(".add-image").addClass("hide");
    };
    reader.readAsDataURL(input.files[0]);
    $("#save-cta").removeClass("hide");
  }
}

$("#back-btn").click(function () {
  $(".card-container").removeClass("hide");
  $(".message-container").addClass("hide");
  $("#save-cta").addClass("hide");
});

$("#save-cta:not(.disabled)").click(function () {
  let saveBtn = $("#save-cta");
  saveBtn.addClass("disabled");
  saveBtn.text("SAVING..");

  getData()
    .then((data) => {
      console.log(data);
      $.ajax({
        url: "./quote",
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json",
        success: function () {
          saveBtn.removeClass("disabled");
          saveBtn.text("SAVE");
          $("#back-btn").trigger("click");
        },
      });
    })
    .catch((err) => {
      console.log("could not upload");
      console.log(err.message);
    });
});

function isValid(field) {
  return field.length > 4;
}

function getData() {
  return new Promise((resolve, reject) => {
    let imageSrcSplit = $(".hero-image").attr("src").split("/");
    let quote = $("#message").val();
    let imageName = imageSrcSplit[imageSrcSplit.length - 1];

    if (!isValid(quote)) {
      return reject(new Error("Quote not fond"));
    }

    if (Message.hasNewImage) {
      let newImage = $(".add-image").prop("files")[0];
      if (!newImage) {
        return reject(new Error("New image not fond"));
      }
      imageName = `${new Date().getTime()}-${newImage.name}`;
      let storageRef = storage.ref("images/");
      return storageRef
        .child(imageName)
        .put(newImage)
        .then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            return resolve({
              quote,
              image_name: imageName,
              image_link: downloadURL,
            });
          });
        });
    }
    if (!isValid(imageName)) {
      return reject(new Error("imageName not fond"));
    }
    return resolve({
      quote,
      image_name: imageName,
    });
  });
}
