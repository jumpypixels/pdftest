import React, { useState, useRef, useEffect } from 'react';
import {
    PDFDocument,  PDFName,
    PDFNumber,
    PDFString,
    PDFBool
} from 'pdf-lib'
import Sample from './images/template.pdf';


const getAcroFields = (pdfDoc) => {
    if (!pdfDoc.catalog.get(PDFName.of('AcroForm'))) return [];
    const acroForm = pdfDoc.context.lookup(pdfDoc.catalog.get(PDFName.of('AcroForm')));

    if (!acroForm.get(PDFName.of('Fields'))) return [];
    const acroFields = acroForm.context.lookup(acroForm.get(PDFName.of('Fields')));

    return acroFields.array.map(ref => acroForm.context.lookup(ref));
};


const logAcroFields = (pdfDoc) => {
    const acroFields = getAcroFields(pdfDoc);
    console.log(acroFields)
    acroFields.forEach((acroField) => {
        // acroField.delete(PDFName.of('AP'));
        logAcroField(acroField)
    });
};



const logAcroField = (acroField) => {
//    console.log(acroField);
    console.log(
        'Field Name:',
        acroField.get(PDFName.of('T')),
        'Field Type:',
        acroField.get(PDFName.of('FT')),
        'Field Value:',
        acroField.get(PDFName.of('V')),
        'X:',
        'Appearence Value:',
        acroField.get(PDFName.of('AP'))
    );
};

const logAcroFieldByName=(pdfDoc,name)=>{
    logAcroField(findAcroFieldByName(pdfDoc,name))
}

const findAcroFieldByName = (pdfDoc, name) => {
    const acroFields = getAcroFields(pdfDoc);
    return acroFields.find((acroField) => {
        const fieldName = acroField.get(PDFName.of('T'));
        return !!fieldName && fieldName.value === name;
    });
};

const fillAcroTextField = (
    // pdfDoc,
    acroField,
    // fontObject,
    text,
    // fontSize = 15,
) => {
    // *** Must run this to make the change visible
    acroField.delete(PDFName.of('AP'));
    acroField.set(PDFName.of('V'), PDFString.of(text));
    // acroField.set(PDFName.of('Ff'), PDFNumber.of(
    //     1 << 0 // Read Only
    //     // |
    //     // 1 << 12 // Multiline
    // ));
};
const fillInField = (pdfDoc, fieldName, text, fontSize) => {
    const field = findAcroFieldByName(pdfDoc, fieldName);
    if (!field) {
        console.log(`Missing AcroField: ${fieldName}`);
        return;
    }
    // fillAcroTextField(pdfDoc, field, FontHelvetica, text, fontSize);
    fillAcroTextField(field, text);
};

const getFieldRect = (pdfDoc, fieldName) => {
    const acroField = findAcroFieldByName(pdfDoc, fieldName);
    if (acroField) {
        return acroField.get(PDFName.of('Rect')).array
    }
    return null;
}

const lockField = acroField => {
    acroField.set(PDFName.of('Ff'), PDFNumber.of(1 << 0 /* Read Only */));
};


export default function PDFTest() {
    const iframeRef = useRef();
    const [pdfDoc, setpdfDoc] = useState(null)

    const loadPDF = async () => {
        const existingPdfBytes = await fetch(Sample).then(res => res.arrayBuffer())
        const pD = await PDFDocument.load(existingPdfBytes);

        const acroForm = await pD.context.lookup(
            pD.catalog.get(PDFName.of('AcroForm')),
        );
        // Must set this first otherwise text will show only after click
        acroForm.set(PDFName.of('NeedAppearances'), PDFBool.True);

        refreshDoc(existingPdfBytes, pD)
        setpdfDoc(pD)

        // logAcroFields(pD)
        logAcroFieldByName(pD,"Age")


    }


    useEffect(() => {
        loadPDF();
    }, [])

    const onClick = async () => {
        if (pdfDoc != null) {
            // logAcroFields(pdfDoc)
            logAcroFieldByName(pdfDoc,"Age")
        }
    }


    const refreshDoc = async (pdfBytes) => {
        const pdfUrl = URL.createObjectURL(
            new Blob([pdfBytes], { type: 'application/pdf' }),
        );
        iframeRef.current.src = pdfUrl;
    }

    return (
        <>
            <iframe ref={iframeRef} style={{ width: '100vw', height: '80vh' }}></iframe>
            <button onClick={onClick}>Log</button>
        </>
    )
}


