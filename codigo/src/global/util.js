import { toast } from "react-toastify";
import html2canvas from "html2canvas";

function convertDecimal(num) {
  try {
    if (!num) {
      throw new Error({ message: "Not number" });
    }
    const convert = parseFloat(num).toFixed(2).replace(".", ",");

    return convert;
  } catch (err) {
    return "0,00";
  }
}

const updateToast = (ref, text, type, timeClose = 5000) => {
  toast.update(ref.current, {
    render: text,
    type: toast.TYPE[type],
    autoClose: timeClose,
  });
};

const gerarImagemByIdHtml = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const input = document.getElementById(id);
  html2canvas(input).then(async (canvas) => {
    const imgData = canvas.toDataURL("image/png");

    const response = await fetch(imgData);
    const blob = await response.blob();

    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);

    toast.success("Copiado com sucesso");
  });
};

export { convertDecimal, updateToast, gerarImagemByIdHtml };
