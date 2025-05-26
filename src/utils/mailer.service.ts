import { enviroment } from 'src/utils/environment.prod'
import { join } from 'path';
import { Bill } from 'src/bill/entities/bill.entity';
import { Order } from 'src/orders/entities/order.entity';
import * as nodemailer from 'nodemailer';
import { ConfigurationSheetService } from 'src/configuration-sheet/configuration-sheet.service';
import * as fs from 'fs';
import * as path from 'path';
import { HTMLTemplates } from 'src/utils/html-templates.util';

export class MailerService {
    static sendEmail(bill: Bill, clientEmail: string, dataEmail: any) {
        const company = dataEmail.company;
        const companyEmail = dataEmail.email;
        const companyPhone = dataEmail.phone;
        const companyCountry = dataEmail.country;
        const companyCode = dataEmail.country_code;

        // Verificar que la imagen esté presente
        if (!dataEmail.image) {
            console.error('La imagen no está definida');
            return;
        }

        const imageBuffer = Buffer.from(dataEmail.image); // Convertir el array de datos a Buffer
        const imageBase64 = imageBuffer.toString('base64'); // Convertir el Buffer a base64
        const imageMimeType = 'image/png'; // Ajusta el tipo MIME según sea necesario

        let transporter = nodemailer.createTransport({
            host: 'mail.simerelectronics.com',
            port: 465,
            secure: true, // Habilita SSL/TLS
            auth: {
                user: 'poseidon@simerelectronics.com',
                pass: '*;)HX.zTL,Jp'
            },
        });

        // Función para formatear los números con separador de miles
        function formatNumberWithCommas(number: number) {
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        const formattedCharge = formatNumberWithCommas(Math.floor(bill.charge.masaTotal)); // Formatear los kilos cargados
        const formattedTotal = formatNumberWithCommas(Math.floor(bill.total)); // Formatear el valor total sin decimales
        const codewithoutcharacters = companyCode.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos del código del país
        const remision = HTMLTemplates.remision_template(bill, company, companyEmail, codewithoutcharacters, companyPhone, formattedCharge);

        let mailOptions = {
            from: 'poseidon@simerelectronics.com',
            to: clientEmail,
            subject: `${company} | Remisión Establecimiento: ${bill.branch_office_name}`,
            html: remision,
            attachments: [
                {
                    filename: `remisión_${bill.id}.pdf`,
                    path: join(enviroment.srcDir, 'pdf', `bill_${bill.id}.pdf`),
                    cid: 'Remisión'
                },
                {
                    filename: `${company}.png`,
                    content: imageBuffer,
                    cid: 'companyLogo' // Referencia del CID en el HTML
                }
            ]
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log(`Email Enviado a ${bill.client_firstName} ${bill.client_lastName} | Email sent: ${info.response}`);
                const filename = `bill_${bill.id}.pdf`
                const filepath = join(enviroment.srcDir, 'pdf', filename)

                try {
                    fs.promises.unlink(filepath)
                } catch (err) {
                    throw new Error(
                        `Error al eliminar el archivo ${filename}: ${err.message}`,
                    )
                }
            }
        });
    }

    static sendToken(order: Order, clientEmail: string, dataEmail: any) {
        const company = dataEmail.company;
        const companyEmail = dataEmail.email;
        const companyPhone = dataEmail.phone;
        const companyCountry = dataEmail.country;
        const companyCode = dataEmail.country_code;

        // Verificar que la imagen esté presente
        if (!dataEmail.image) {
            console.error('La imagen no está definida');
            return;
        }

        const imageBuffer = Buffer.from(dataEmail.image); // Convertir el array de datos a Buffer
        const imageBase64 = imageBuffer.toString('base64'); // Convertir el Buffer a base64
        const imageMimeType = 'image/png'; // Ajusta el tipo MIME según sea necesario

        try {
            let transporter = nodemailer.createTransport({
                host: 'mail.simerelectronics.com',
                port: 465,
                secure: true, // Habilita SSL/TLS
                auth: {
                    user: 'poseidon@simerelectronics.com',
                    pass: '*;)HX.zTL,Jp'
                },
            });

            const codewithoutcharacters = companyCode.replace(/[^0-9]/g, ''); // Eliminar caracteres no numéricos del código del país
            const order_template = HTMLTemplates.order_template(order, company, companyEmail, codewithoutcharacters, companyPhone);

            let mailOptions = {
                from: 'poseidon@simerelectronics.com',
                to: clientEmail,
                subject: `${company} | Token de validación para cargue`,
                html: order_template,
                attachments: [
                    {
                        filename: `${company}.png`,
                        content: imageBuffer,
                        cid: 'companyLogo' // Referencia del CID en el HTML
                    }
                ]
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(`Establecimiento: ${order.branch_office.name} | Token enviado a ${order.branch_office.client[0].firstName} ${order.branch_office.client[0].lastName} | Email sent: ${info.response}`);
                }
            });

        } catch (error) {
            console.log('Error sending token: ', error);
        }
    }

}
