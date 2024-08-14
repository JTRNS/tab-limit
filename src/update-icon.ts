export async function updateIcon(count: number, limit: number) {
  const imageData = drawSpeedometer(count, limit);
  await chrome.action.setIcon({ imageData: imageData });
  const badgeText = await chrome.action.getBadgeText({});
  const remaining = Math.max(0, limit - count);
  if (remaining === 0) {
    if (badgeText !== "!") {
      updateBadge({ background: "orange", color: "white", text: "!" });
    }
  } else if (badgeText !== "") {
    updateBadge({ text: "" }); // removes badge
  }
}

type BadgeUpdate = {
  color?: string | browserAction.ColorArray;
  background?: string | browserAction.ColorArray;
  text?: string;
};

function updateBadge(update: BadgeUpdate) {
  if (update.color !== undefined) {
    chrome.action.setBadgeTextColor({ color: update.color });
  }
  if (update.background !== undefined) {
    chrome.action.setBadgeBackgroundColor({ color: update.background });
  }
  if (update.text !== undefined) {
    chrome.action.setBadgeText({ text: update.text });
  }
}

function drawSpeedometer(value: number, max: number, min = 0) {
  const size = 16;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) * 0.75;
  const strokeWidth = (size / 2) * 0.25;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;

  const endAngleGreenArc = startAngle + (endAngle - startAngle) * 0.5;
  const endAngleOrangeArc = startAngle + (endAngle - startAngle) * 0.9;

  const valueAngle =
    ((value - min) / (max - min)) * (endAngle - startAngle) + startAngle;

  const offscreen = new OffscreenCanvas(size, size);
  const ctx = offscreen.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.lineWidth = strokeWidth;

  function drawSection(startAngle: number, endAngle: number, color: string) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  }

  drawSection(startAngle, endAngleGreenArc, "green");
  drawSection(endAngleGreenArc, endAngleOrangeArc, "orange");
  drawSection(endAngleOrangeArc, endAngle, "red");

  // center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // needle
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + Math.cos(valueAngle) * radius * 0.8,
    centerY + Math.sin(valueAngle) * radius * 0.8
  );
  ctx.strokeStyle = "#ff3333";
  ctx.lineWidth = size * 0.1;
  ctx.stroke();

  return ctx.getImageData(0, 0, 16, 16);
}
