import { onCSVParsed } from "./parser.js";

const fileInput = document.querySelector("#file-upload");

fileInput.addEventListener("change", handleFileUpload);

function handleFileUpload(e) {
	const file = e.target.files[0];
	if (!file || !file.name.toLowerCase().endsWith(".csv")) return;

	Papa.parse(file, {
		header: true,
		skipEmptyLines: true,
		complete: onCSVParsed,
	});
}
