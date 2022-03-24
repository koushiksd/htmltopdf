var fs = require("fs");
var pdf = require("html-pdf");

var options = { format: "A4", orientation: "portrait" };
let { data1, data2 } = require("./smapleData");
var html = fs.readFileSync("./index.html", "utf8");

function valueInWords(value) {
  let ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  let tens = [
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  let digit = 0;
  if (value < 20) return ones[value];
  if (value < 100) {
    digit = value % 10; //remainder
    return (
      tens[Math.floor(value / 10) - 2] + " " + (digit > 0 ? ones[digit] : "")
    );
  }
  if (value < 1000) {
    return (
      ones[Math.floor(value / 100)] +
      " hundred " +
      (value % 100 > 0 ? valueInWords(value % 100) : "")
    );
  }
  if (value < 100000) {
    return (
      valueInWords(Math.floor(value / 1000)) +
      " thousand " +
      (value % 1000 > 0 ? valueInWords(value % 1000) : "")
    );
  }
  if (value < 10000000) {
    return (
      valueInWords(Math.floor(value / 100000)) +
      " lakh " +
      (value % 100000 > 0 ? valueInWords(value % 100000) : "")
    );
  }
  return (
    valueInWords(Math.floor(value / 10000000)) +
    " crore " +
    (value % 10000000 > 0 ? valueInWords(value % 10000000) : "")
  );
}
exports.createPdf = async (req, res, next) => {
  let {
    invoiceDetailTable,
    midSection,
    headerInfo,
    bankDetails,
    termsAndConditions,
  } = data1;
  let products = [];
  let foundCount = null;
  let igstfound = false,
    productsDetails,
    productsHeader;
  let product = {
    name: "",
    mrp: "",
    price: "",
    unit: "",
    sgst: "",
    cgst: "",
    hsn: "",
    total: "",
    igst: "",
  };
  let total = 0,
    totlatax = 0,
    totalwithtax = 0,
    sgst = 0,
    cgst = 0,
    igst = 0;

  invoiceDetailTable.forEach((i, index) => {
    if (i.label == "Grand Total") {
      total = Number(i.value).toFixed(3);
    }
    if (i.label == "Total tax") {
      totlatax = Number(i.value).toFixed(3);
    }
    if (i.label == "Total with Tax") {
      totalwithtax = Number(i.value).toFixed(3);
    }
    if (i.subHeader) {
      products.push(product);

      foundCount = foundCount != null ? foundCount + 1 : 0;

      products[foundCount].name = i.label;
      product = {
        name: "",
        mrp: "",
        price: "",
        unit: "",
        sgst: "",
        cgst: "",
        hsn: "",
        total: "",
        igst: "",
      };
    } else {
      switch (i.label) {
        case "Base Price":
          products[foundCount].mrp = i.value;

          break;
        case "Your Price":
          products[foundCount].price = i.value;
          break;
        case "Quantity":
          products[foundCount].unit = i.value;
          break;
        case "SGST Tax":
          sgst = Number(Number(sgst) + Number(i.value)).toFixed(3);
          products[foundCount].sgst = i.value;
          break;
        case "CGST Tax":
          cgst = Number(Number(cgst) + Number(i.value)).toFixed(3);
          products[foundCount].cgst = i.value;
          break;
        case "HSN Code Tax":
          products[foundCount].hsn = i.value;
          break;
        case "Sub Total":
          products[foundCount].total = i.value;
          break;
        case "IGST Tax":
          igstfound = true;
          igst = Number(Number(igst) + Number(i.value)).toFixed(3);
          products[foundCount].igst = i.value;
          break;
      }
    }
  });
  let termsAndConditionsComponent = `
  ${termsAndConditions.map((i, index) => {
    return `<p style='margin-top:10px'>${index + 1}. ${i}</p>`;
  })}`;
  let Bankinfo = `  ${Object.keys(bankDetails).map((i) => {
    return `<p style='margin-top:10px'>${bankDetails[i]}</p>`;
  })}`;
  Bankinfo = Bankinfo.replace(/,/g, "");
  if (igstfound) {
    productsHeader = `<tr class="Tableheader">
      <td style="font-weight:bold">
          HSN Code
      </td>
      <td style="font-weight:bold">
          Item Descreption
      </td>
      <td style="font-weight:bold">
          MRP
      </td>
      <td style="font-weight:bold">
          Price
      </td>
      <td style="font-weight:bold">
          Units
      </td>
      <td style="font-weight:bold">
          IGST%
      </td>
    
      <td style="font-weight:bold">
          IGST Amount
      </td>
    
      <td style="font-weight:bold">
          Total Amount
      </td>
  </tr>`;
    productsDetails = `${products.map((i) => {
      return ` <tr>
            <td>${i.hsn}</td>
            <td>${i.name}</td>
            <td>${i.mrp}</td>
            <td>${i.price}</td>
            <td>${i.unit}</td>
            <td>20.0%</td>
         
            <td>${i.igst}</td>
        
            <td>${i.total}</td>
          </tr>`;
    })}`;
  } else {
    productsHeader = `<tr class="Tableheader">
      <td style="font-weight:bold">
          HSN Code
      </td>
      <td style="font-weight:bold">
          Item Descreption
      </td>
      <td style="font-weight:bold">
          MRP
      </td>
      <td style="font-weight:bold">
          Price
      </td>
      <td style="font-weight:bold">
          Units
      </td>
      <td style="font-weight:bold">
          CGST%
      </td>
      <td style="font-weight:bold">
          SGST%
      </td>
      <td style="font-weight:bold">
          CGST Amount
      </td>
      <td style="font-weight:bold">
          SGST Amount
      </td>
      <td style="font-weight:bold">
          Total Amount
      </td>
  </tr>`;
    productsDetails = `${products.map((i) => {
      return ` <tr>
            <td>${i.hsn}</td>
            <td>${i.name}</td>
            <td>${i.mrp}</td>
            <td>${i.price}</td>
            <td>${i.unit}</td>
            <td>10.0%</td>
            <td>10.0%</td>
            <td>${i.cgst}</td>
            <td>${i.sgst}</td>
            <td>${i.total}</td>
          </tr>`;
    })}`;
  }

  productsDetails = productsDetails.replace(/,/g, "");
  termsAndConditionsComponent = termsAndConditionsComponent.replace(/,/g, "");
  console.log(
    typeof termsAndConditionsComponent,
    "termsAndConditionsComponent"
  );
  let htmlData = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        
        <title></title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-size: 14px;
            }
    
            .header {
                margin-top: 10px;
                width: 100%;
                border: none !important;
            }
    
            .header tr,
            .header td {
                border: none !important;
            }
    
            .header h1 {
                color: #164595;
            }
    
            .InfoSection{
              width: 100%;
            }
          
            .fromInvoice {
                text-align: center;
    
            }
    
            .fromInvoice h1 {
                margin-bottom: 5px;
                color: '#0F2E64';
            }
    
            .fromInvoice p {
                margin-top: 5px;
            }
    
            .InfoSection {
            
             
               
               margin-top: 20px;
            }
            .mainInfo{
            
                width: 100%;
            }
            .infoValue{
    
                text-decoration: underline;
                text-align: left !important;
            }
            .infoKey{
              
                text-align: right;
                padding-right: 10px;
            }
            .itemList {
                
                margin-top: 20px;
            }
    
            .itemList table {
                border-collapse: collapse;
    
                width: 100%;
    
            }
    
            .itemList table,
           .itemList tr,
           .itemList td {
               border: solid 2px black;
                text-align: center;
                padding: 4px;
                font-size: 12px;
            }
    
            table .Tableheader {
                font-weight: bold;
            }
    
            .totalAmountBottom {
                font-weight: bold;
                text-align: right;
                padding-right: 10px;
            }
        </style>
    </head>
    
    <body>
        <div>
        <table style='width:100%'>
            <tr>
            <td style='width:100px'>
            <img
            style="height:70px;position:absolute;top:5px;left:5px"
                src="data:image/png;base64,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" />
        </td>
                <td>
                    <img src='${
                      headerInfo.qrlink
                    }' style="height:60px;position:absolute;top:5px;right:5px"/>
                </td>
            </tr>
        </table>
            <table class="header">
                <tr>
                  
                    <td class="fromInvoice">
                        <h1 style="font-size:20px">
                            ${headerInfo.invoiceHeader}
                        </h1>
                        <p>Address:${headerInfo.address} </p>
                        <p>Mobile: ${
                          headerInfo.phoneNumber
                        }; Website:www.seva-u.com</p>
                        <p>GST No.:${headerInfo.gstNumber}</p>
                        <p>${headerInfo.headerLastLine}</p>
                    </td>
                </tr>
            </table>
            <table class="InfoSection">
                <tr>
                    <td class="billinfo">
                        <table class="mainInfo">
                           
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Bill To:
                                </td>
                                <td class="infoValue">
                                    ${midSection.billTo}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Ship To:
                                </td>
                                <td class="infoValue" >
                                ${midSection.shipTo}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Mobile:
                                </td>
                                <td class="infoValue" >
                                ${midSection.phoneNumber}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    GSTIN:
                                </td>
                                <td class="infoValue">
                                ${midSection.GSTIN}
                                </td>
                            </tr>
                        </table>
                      
                    </td>
                    <td class=" invoiceinfo">
                        <table class="mainInfo">
                            <tr>
                     
                                <td class="infoKey" style="width:120px">
                                    Invoice No:
                                </td>
                                <td class="infoValue">
                                ${midSection.invoiceNumber}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Invoice Date:
                                </td>
                                <td class="infoValue">
                                ${midSection.invoiceDate}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Due Date:
                                </td>
                                <td class="infoValue">
                                ${midSection.dueDate}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Order Date:
                                </td>
                                <td class="infoValue">
                                ${midSection.orderDate}
                                </td>
                            </tr>
                        </table>
    
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    Payment Mode:
                                </td>
                                <td class="infoValue">
                                ${midSection.paymentMode}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    State Name:
                                </td>
                                <td class="infoValue">
                                ${midSection.stateName}
                                </td>
                            </tr>
                        </table>
                        <table class="mainInfo">
                            <tr>
                                <td class="infoKey" style="width:120px">
                                    State Code:
                                </td>
                                <td class="infoValue">
                                ${midSection.stateCode}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
    
            </table>
            <div class="itemList">
                <table style="width:95%;margin:0px 2.5%;">
                ${productsHeader}
                 ${productsDetails}
                    
                    <tr>
                        <td class="totalAmountBottom" colspan="${
                          igstfound ? 6 : 7
                        }" style="text-align: right;font-weight: bold;">
                            Total Amount
                        </td>
                       
                        <td style="font-weight:bold">
                            ${igstfound ? igst : cgst}
                        </td>
                        ${
                          !igstfound
                            ? ` <td style="font-weight:bold">
                        ${sgst}
                    </td>`
                            : ""
                        }
                       
                        <td style="font-weight:bold">
                            ${totalwithtax}
                        </td>
                    </tr>
                </table>
            </div>
            <p style="margin:20px;font-weight: bold;">Total Amount in Words: ${valueInWords(
              Math.round(totalwithtax)
            )}</p>
            <table style="width:100%;margin-top: 10px;margin-bottom:10px">
                <tr>
                    <td style="padding-left:10px">
                        <h1 style="font-size:18px">
                            Our Bank Details:
                        </h1>
                     ${Bankinfo}
                    </td>
                    <td>
                        <h1 style="font-size:18px">
                            Terms and Conditions:
                        </h1>
                      ${termsAndConditionsComponent}
                    </td>
                </tr>
            </table>
            <p style="margin:20px;font-weight: bold;">${
              headerInfo.invoiceHeader
            }</p>
            <p style="margin-top:50px;margin-left:20px;font-weight: bold;">(Authorised Signatory)</p>
            <p style="text-align: center; font-size: 12px;">This is a computer generated invoice</p>
        </div>
    </body>
    
    </html>`;

  pdf.create(htmlData, options).toBuffer(function (err, resp) {
    if (err) return console.log(err);
    else {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline;filename=yolo.pdf");
      return res.status(200).send(resp);
    }
  });
};
