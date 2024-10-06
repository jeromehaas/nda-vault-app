// IMPORTS
import './sidebar.scss';
import TextInput from '~/components/inputs/text-input/text-input.jsx';
import DateInput from '~/components/inputs/date-input/date-input.jsx';
import CheckboxInput from '~/components/inputs/checkbox-input/checkbox-input.jsx';
import CanvasInput from '~/components/inputs/canvas-input/canvas-input.jsx';
import SubmitInput from '~/components/inputs/submit-input/submit-input.jsx';
import SignaturePad from 'signature_pad';
import {createEffect, createSignal, onMount, useContext} from 'solid-js';
import {FormContext} from '~/contexts/form-context.jsx';
import NdaPdfCreator from '~/utils/nda-pdf-creator.js';
import Dispatcher from '~/utils/dispatcher.js';

// SIDEBAR
const Sidebar = () => {
	
	// SETUP STATE
	const [signaturePad, setSignaturePad] = createSignal(null);
	
	// SETUP CONTEXT
	const [form, setForm] = useContext(FormContext);
	
	// SETUP REFS
	let signaturePadRef;
	
	// SETUP NDA-PDF-CREATOR
	const ndaPdfCreator = new NdaPdfCreator();
	
	// SETUP DISPATCHER
	const dispatcher = new Dispatcher();
	
	// HANDLE END SIGNATURE DRAW
	const handleCanvasInputUpdate = () => {
		setForm(form => ({...form, fields: {...form.fields, signature: signaturePad().toDataURL('image/png')}}));
	};
	
	// HANDLE LANGUAGE UPDATE
	const handleLanguageUpdate = () => {
		if (form.language === 'en') {
			setForm({...form, language: 'de'});
		} else if (form.language === 'de') {
			setForm({...form, language: 'it'});
		} else if (form.language === 'it') {
			setForm({...form, language: 'en'});
		}
	};
	
	// HANDLE TEXT INPUT UPDATE
	const handleTextInputUpdate = (event, field) => {
		setForm((form => ({...form, fields: {...form.fields, [field]: event.target.value}})));
	};
	
	// HANDLE CHECKBOX INPUT UPDATE
	const handleCheckboxInputUpdate = (event, field) => {
		setForm((form => ({...form, fields: {...form.fields, [field]: event.target.checked}})));
	};
	
	// CHECK FORM VALIDITY
	const checkFormValidity = () => {
		if (form.fields.company !== '' && form.fields.firstname !== '' && form.fields.lastname !== '' && form.fields.street !== '' && form.fields.plz !== '' && form.fields.town !== '' && form.fields.country !== '' && form.fields.date !== '' && form.fields.consent === true && form.fields.signature !== '') {
			setForm((form) => ({...form, state: {...form.state, isValid: true}}));
		} else {
			setForm((form) => ({...form, state: {...form.state, isValid: false}}));
		}
	};
	
	// HANDLE RESET SIGNATURE
	const handleResetSignature = (event) => {
		event.preventDefault();
		signaturePad().clear();
		setForm(form => ({
			...form,
			fields: {
				...form.fields,
				signature: '',
			},
		}));
	};
	
	// HANDLE SUBMIT
	const handleSubmit = (event) => {
		
		// PREVENT DEFAULT
		event.preventDefault();
		
		// GET VALUES
		ndaPdfCreator.printDocument({language: form.language, variables: form.fields});
		
		// GET ARRAY-BUFFER
		const arrayBuffer = ndaPdfCreator.getDocument();
		
		// SEND DOCUMENT
		 dispatcher.sendMail({variables: form.fields, attachment: arrayBuffer});
		
	};
	
	// SETUP SIGNATURE-PAD
	onMount(() => {
		
		// SETUP SIGNATURE
		const signature = new SignaturePad(signaturePadRef);
		
		// APPEND SIGNATURE
		setSignaturePad(signature);
		
	});
	
	// OBSERVE FORM
	createEffect(() => {
		checkFormValidity();
	});
	
	// RENDER
	return (
	<div class='sidebar'>
		<button class='sidebar__language-toggle' onClick={handleLanguageUpdate}>{form.language}</button>
		<h3 class='sidebar__heading'>
			{form.language === 'en' && 'Non-Disclosure Agreement'}
			{form.language === 'de' && 'Geheimhaltungsvereinbarung'}
			{form.language === 'it' && 'Accordo di Non Divulgazione'}
		</h3>
		<form class='sidebar__form form' action=''>
			<TextInput className='form__input form__input--100' label={{en: 'Company', de: 'Firma', it: 'Azienda'}} name='company' id='company' value={form.fields.company} onInput={(event) => handleTextInputUpdate(event, 'company')}/>
			<TextInput className='form__input form__input--100' label={{en: 'Firstname', de: 'Vorname', it: 'Nome'}} name='firstname' id='firstname' value={form.fields.firstname} onInput={(event) => handleTextInputUpdate(event, 'firstname')}/>
			<TextInput className='form__input form__input--100' label={{en: 'Lastname', de: 'Lastname', it: 'Cognome'}} name='lastname' id='lastname' value={form.fields.lastname} onInput={(event) => handleTextInputUpdate(event, 'lastname')}/>
			<TextInput className='form__input form__input--100' label={{en: 'E-Mail', de: 'E-Mail', it: 'E-Mail'}} name='email' id='email' value={form.fields.email} onInput={(event) => handleTextInputUpdate(event, 'email')}/>
			<TextInput className='form__input form__input--100' label={{en: 'Street', de: 'Strasse', it: 'Via'}} name='street' id='street' value={form.fields.street} onInput={(event) => handleTextInputUpdate(event, 'street')}/>
			<TextInput className='form__input form__input--25' label={{en: 'PLZ', de: 'PLZ', it: 'CAP'}} name='plz' id='plz' value={form.fields.plz} onInput={(event) => handleTextInputUpdate(event, 'plz')}/>
			<TextInput className='form__input form__input--75' label={{en: 'Town', de: 'Ort', it: 'Città'}} name='town' id='town' value={form.fields.town} onInput={(event) => handleTextInputUpdate(event, 'town')}/>
			<TextInput className='form__input form__input--100' label={{en: 'Country', de: 'Country', it: 'Paese'}} name='country' id='country' value={form.fields.country} onInput={(event) => handleTextInputUpdate(event, 'country')}/>
			<DateInput className='form__input form__input--100' label={{en: 'Date', de: 'Datum', it: 'Data'}} name='date' id='date' value={form.fields.date} onInput={(event) => handleTextInputUpdate(event, 'date')}/>
			<CheckboxInput className='form__input form__input--100' label={{en: 'Consent', de: 'Einverständnis', it: 'Consenso'}} options={[{name: 'consent', id: 'consent', value: form.fields.consent, onInput: (event) => handleCheckboxInputUpdate(event, 'consent'), label: {en: 'I hereby confirm that I have thoroughly read, fully understood, and accept the terms and conditions outlined in the Non-Disclosure Agreement provided to me.', de: 'Hiermit bestätige ich, dass ich die im Geheimhaltungsvereinbarung dargelegten Bedingungen gründlich gelesen, vollständig verstanden und akzeptiert habe.', it: 'Con la presente confermo di aver letto attentamente, compreso pienamente e accettato i termini e le condizioni descritti nell\'Accordo di Non Divulgazione che mi è stato fornito.'}}]}/>
			<CanvasInput className='form__input form__input--100' label={{en: 'Signature', de: 'Unterschrift', it: 'Firma'}} name='signature' id='signature' ref={signaturePadRef} onEnd={(event) => handleCanvasInputUpdate(event)} onReset={(event) => handleResetSignature(event)} buttonLabel={{en: 'Reset', de: 'Zurücksetzen', it: 'Reimposta'}}/>
			<SubmitInput className='form__input form__input--100' label={{en: 'Submit', de: 'Absenden', it: 'Invia'}} disabled={!form.state.isValid} onClick={(e) => handleSubmit(e)}/>
		</form>
	</div>
	);
	
};

// EXPORTS
export default Sidebar;