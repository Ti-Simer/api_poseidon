export class HTMLTemplates {
    static remision_template(bill, company, companyEmail, companyCode, companyPhone, formattedCharge) {
        return `<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: #f8fafc;
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
        }

        .container-main {
            position: relative;
            padding: 16px;
        }

        .max-w-3xl {
            max-width: 768px;
            margin: 0 auto;
        }

        .card {
            margin-top: 12px;
            background: #fff;
            border-radius: 0 0 8px 8px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            line-height: normal;
            padding: 24px;
        }

        .text-indigo {
            color: #6366f1;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.5s;
        }

        .text-indigo:hover {
            color: #374151;
        }

        .title {
            color: #111827;
            font-weight: bold;
            font-size: 32px;
            margin: 0;
        }

        .info-row {
            padding: 20px 0 20px 0;
            font-size: 14px;
            color: #111827;
            display: flex;
            align-items: center;
        }

        .info-row span {
            margin-right: 12px;
            display: flex;
            align-items: center;
        }

        .info-row svg {
            color: #6366f1;
            margin-right: 4px;
        }

        .divider {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 16px 0;
        }

        .lead {
            font-size: 16px;
            line-height: 1.5;
            margin: 20px 0;
        }

        .section-title {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0 10px 0;
        }

        .summary-list {
            text-align: left;
            color: #000;
            font-size: 16px;
            border: 0;
            margin-bottom: 40px;
            padding-left: 0;
            list-style: none;
        }

        .summary-list li {
            color: #000;
            border: 0;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .summary-list li:not(:first-child) {
            font-weight: normal;
        }


        @media (min-width: 640px) {
            .footer-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .note {
                width: 70%;
            }
        }

        @media (min-width: 1024px) {
            .footer-grid {
                grid-template-columns: repeat(4, 1fr);
            }
        }

        .footer-bottom {
            display: flex;
            flex-direction: column-reverse;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            padding-bottom: 40px;
            border-top: 1px solid #e5e7eb;
        }

        @media (min-width: 1024px) {
            .footer-bottom {
                flex-direction: row;
                display: block;
            }
        }

        .footer-bottom p {
            font-size: 14px;
            color: #4b5563;
            margin: 0;
        }

        .footer-bottom img {
            width: 180px;
        }
    </style>
</head>

<body>
    <div class="container-main">
        <div class="max-w-3xl">
            <div class="card">
                <div>
                    <a href="https://simerelectronics.com/" class="text-indigo">Sistema poseidon</a>
                    <h1 class="title">${company}</h1>
                    <div style="margin: 0 auto; flex-grow: 1; flex-basis: 200; margin: 0.2rem;">
                        <img src="cid:companyLogo" style="width: 300px;">
                    </div>
                    <div class="info-row">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="#014e87" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-calendar-clock-icon lucide-calendar-clock">
                                <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                                <path d="M16 2v4" />
                                <path d="M8 2v4" />
                                <path d="M3 10h5" />
                                <path d="M17.5 17.5 16 16.3V14" />
                                <circle cx="16" cy="16" r="6" />
                            </svg>
                            <span>${bill.create}</span>
                        </span>
                        <span
                            style="display: flex; align-items: center; color: #6366f1; margin-right: 12px; text-decoration: none;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="#014e87" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" class="lucide lucide-user-icon lucide-user">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span style="margin-left: 4px;">${bill.client_firstName} ${bill.client_lastName}</span>
                        </span>
                    </div>
                    <hr class="divider">
                    <p class="lead">
                        Es un placer informarte que hemos completado exitosamente el cargue de producto
                        en su establecimiento ${bill.branch_office_name} relacionado con tu solicitud. Esta
                        remisión ha sido
                        asignada con el número <span style="font-weight: bold; color: #dc3545">${bill.bill_code}</span>,
                        y
                        contiene detalles precisos sobre los productos/servicios remitidos.
                    </p>
                    <h3 class="section-title">A continuación, encontrarás un resumen de la remisión:</h3>
                    <ul class="summary-list">
                        <li>Remisión ${bill.bill_code}</li>
                        <li style="font-weight: normal;">Establecimiento: ${bill.branch_office_name} | NIT:
                            ${bill.branch_office_nit}</li>
                        <li style="font-weight: normal;">Fecha: ${bill.create}</li>
                        <li style="font-weight: normal;">Cantidad: ${formattedCharge}Kg | GLP</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <p
        style="color: #9b9b9b; font-size: 13px; text-align: center; width: 35%; margin: 0 auto; border: 1px dashed #9b9b9b; padding: 1.5rem; border-radius: 5px;">
        <span style="font-weight: bold;">Nota:</span> Esta información refleja la actividad de suministro de GLP
        realizada en su establecimiento. Para obtener más detalles, comuníquese directamente con su proveedor,
        ${company}.
    </p>
    <br>
    <div class="footer-bottom"
        style="text-align: center; margin-top: 100px; display: flex; background: #f6f6f6; width: 90%; margin: 0 auto; padding: 1.3rem; border-radius: 5px; justify-content: center;">
        <p style="font-size: 13px; color: #9b9b9b; margin: 0 auto; flex-grow: 1; flex-basis: 200; margin: 0.2rem; width:49%">
            <span style="font-size: 16px; color: #014e87; font-weight: bold;">${company}</span>
            <br>
            <a href="mailto:${companyEmail}" style="text-decoration: none; color: #9b9b9b">
                <span>${companyEmail}</span>
            </a>
            <br>
            <a href="https://api.whatsapp.com/send?phone=${companyPhone}">
                <span>(${companyCode}) ${companyPhone}</span>
            </a>
            <br>
        </p>
        <div style="margin: 0 auto; flex-grow: 1; flex-basis: 200; margin: 0.2rem; float: right; width: 49%">
            <img src="http://172.105.153.203/assets/images/firma_simer.png" style="width: 70%;">
        </div>
    </div>
</body>

</html>`
    }

    static order_template(order, company, companyEmail, companyCode, companyPhone) {
        return `
                    <!DOCTYPE html>
                    <html>

                    <body>
                        <p><span style="font-size: 22px; color: #014e87; text-shadow: rgba(136, 136, 136, 0.7) 0px 2px 2px; font-weight: bold;">${company}</span></p>
                        <p style="text-align: start;color: #fff;font-size: 16px;border: 0px solid rgb(217, 217, 227);">
                            <span style="color: rgb(0, 0, 0);">Estimado/a cliente ${order.branch_office.client[0].firstName} ${order.branch_office.client[0].lastName},</span>
                        </p>
                        <p style="text-align: start;color: #fff;font-size: 16px;border: 0px solid rgb(217, 217, 227); margin-bottom: 50px;">
                            <span style="color: rgb(0, 0, 0);">Su token de validación para su cargue es <span style="font-weight: bold; color: #dc3545">${order.token}</span>
                            </span>
                        </p>
                        <p style="color: #9b9b9b; font-size: 13px; text-align: center; width: 35%; margin: 0 auto; border: 1px dashed #9b9b9b; padding: 1.5rem; border-radius: 5px">
                            <span style="font-weight: bold;">Nota:</span> Por favor, comparta esta información únicamente si es requerida por el operario de ${company}. Este elemento es un validador necesario para llevar a cabo la entrega de GLP en su establecimiento. Para
                            más información, comuníquese directamente con su proveedor, ${company}.
                        </p>
                        <br>
                        <div style="text-align: center; margin-top: 100px">
                            <p style="background: #f6f6f6; width: 70%; margin: 0 auto; padding: 1.3rem; border-radius: 5px; font-size: 13px; color: #9b9b9b">
                                <span style="font-size: 16px; color: #014e87; font-weight: bold;">${company}</span>
                                <br>
                                <span>${companyEmail}</span>
                                <br>
                                <span>(${companyCode}) ${companyPhone}</span>
                                <br>
                            </p>
                        </div>
                        <br>
                        <div style="display: flex; justify-content: space-between; align-items: center; width: 70%; margin: 0 auto;">
                            <div style="margin: 0 auto">
                                <img src="cid:companyLogo" style="width: 300px;">
                            </div>
                            <div style="margin: 0 auto">
                                <img src="http://172.105.153.203/assets/images/firma_simer.png" style="width: 300px;">
                            </div>
                        </div>
                    </body>

                    </html>
                `
    }
}