'use client'
import { ArrowLeft, Info, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useUserStore from '@/../store/useUserStore'
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { auth, db } from '@/../firebase'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'

interface Props {
	quantity: number
	setShowModal: (show: boolean) => void
	handleGoToPay: (idsToMovements: string[]) => void
	titleEntity: string
	slugProgram: string | null
	disableButton: boolean
	eventId: string | null
}

type Inputs = {
	name: string
	lastName: string
	idNumber: string
	email: string
	phone: string
	address: string
	occupation: string
	company: string
	size: string
	bloodType: string
	emergencyName: string
	emergencyPhone: string
	isAllergic: string
	foodRestriction: string
}

export default function Modal({ quantity, setShowModal, handleGoToPay, titleEntity, slugProgram, disableButton, eventId }: Props) {
	const { user } = useUserStore()
	const [typeUser, setTypeUser] = useState<string | null>(titleEntity === 'Barranqui-IA' ? null : 'personal')
	const [userForm, setUserForm] = useState<number>(0)
	const [error, setError] = useState<boolean>(false)
	const [idsToMovements, setIdsToMovements] = useState<string[]>([])
	const [userWentBack, setUserWentBack] = useState<boolean>(false)
	const [hasCar, setHasCar] = useState<string>('NO')
	const [formPerUser, setFormPerUser] = useState([
		{
			name: user && user.name ? user.name : '',
			lastName: user && user.lastName ? user.lastName : '',
			idNumber: user && user.idNumber ? user.idNumber : '',
			age: user && user.age ? user.age : '',
			email: user && user.email ? user.email : '',
			...(typeUser === 'company' && { nit: user && user.nit ? user.nit : '' }),
			phone: user && user.phone ? user.phone : '',
			address: user && user.address ? user.address : '',
			occupation: user && user.occupation ? user.occupation : '',
			company: user && user.company ? user.company : '',
			bloodType: user && user.bloodType ? user.bloodType : '',
			emergencyName: user && user.emergencyName ? user.emergencyName : '',
			emergencyPhone: user && user.emergencyPhone ? user.emergencyPhone : '',
			...((slugProgram && {
				size: ''
			})),
			...((titleEntity === 'Barranqui-IA' || slugProgram) && {isAllergic: 'No', foodRestriction: 'Ninguna', hasCar: 'NO',
				...(hasCar === 'SI' && { carPlate: '' }),
			}),

		}
	])
	const [createUserWithEmailAndPassword] =
		useCreateUserWithEmailAndPassword(auth);


	useEffect(() => {
		if (typeUser === 'personal') {
			formPerUser.forEach((form) => {
				delete form.nit
			})
		} else {
			formPerUser.forEach((form) => {
				form.nit = ''
			})
		}
	}, [typeUser])

	useEffect(() => {
		if (hasCar === 'SI') {
			setFormPerUser(formPerUser.map((form, index) => index === userForm ? {
				...form,
				carPlate: '',
			} : form))
		}
	}, [hasCar])

	const handleOnChangeInput = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormPerUser(formPerUser.map((form, index) => index === userForm ? {
			...form,
			[name]: value,
		} : form));
	}

	const areAllFormsValid = () => {
		return Object.values(formPerUser[userForm]).every(value => value !== '')
	};

	const handleAddNewForm = async () => {
		const allFormsValid = areAllFormsValid()
		setError(!allFormsValid)
		if (userForm < quantity - 1 && allFormsValid) {
			setUserForm(userForm + 1)
			if (!userWentBack) {
				setHasCar('NO')
				setFormPerUser([...formPerUser, {
					name: '',
					lastName: '',
					idNumber: '',
					...(typeUser === 'company' && { nit: '' }),
					age: '',
					email: '',
					phone: '',
					address: '',
					occupation: '',
					company: '',
					...(slugProgram && { size: '' }),
					...(titleEntity === 'Barranqui-IA' && { isAllergic: 'No', foodRestriction: 'Ninguna', hasCar: 'NO' }),
					bloodType: '',
					emergencyName: '',
					emergencyPhone: ''
				}])
			}
		}
		if (allFormsValid && userForm === quantity - 1) {
			const ids = await verifyEmailInFirebase()
			await handleGoToPay(ids)
		}
	}

	const verifyEmailInFirebase = async () => {
		let ids: string[] = []

		await Promise.all(formPerUser.map(async (user, index) => {
			const q = query(collection(db, "users"), where("email", "==", user.email));
			const querySnapshot = await getDocs(q);
			if (!querySnapshot.empty) {
				ids.push(querySnapshot.docs[0].id)
				updateDoc(doc(db, "users", querySnapshot.docs[0].id), {
					name: user.name,
					lastName: user.lastName,
					idNumber: user.idNumber,
					...(typeUser === 'company' && { nit: user.nit }),
					age: user.age,
					email: user.email,
					phone: user.phone,
					address: user.address,
					occupation: user.occupation,
					company: user.company,
					...(slugProgram && { size: user.size }),
					...(titleEntity === 'Barranqui-IA' && { isAllergic: user.isAllergic, foodRestriction: user.foodRestriction, hasCar: user.hasCar, ...(user.hasCar === 'SI' && { carPlate: user.carPlate }) }),
					bloodType: user.bloodType,
					emergencyName: user.emergencyName,
					emergencyPhone: user.emergencyPhone,
				})
				// return true;
			} else {
				const credentials = await createUserWithEmailAndPassword(user.email, 'password12131');

				if (credentials && credentials.user) {
					ids.push(credentials.user.uid)
					const userWithCredentials = credentials.user;
					await setDoc(doc(db, "users", userWithCredentials.uid), {
						email: user.email,
						name: user.name,
						lastName: user.lastName,
						idNumber: user.idNumber,
						...(typeUser === 'company' && { nit: user.nit }),
						age: user.age,
						createdAt: new Date(),
						needPassword: true,
						occupation: user.occupation,
						company: user.company,
						...(slugProgram && { size: user.size }),
						...(titleEntity === 'Barranqui-IA' && { isAllergic: user.isAllergic, foodRestriction: user.foodRestriction, hasCar: user.hasCar,
							...(user.hasCar === 'SI' && { carPlate: user.carPlate }),
						}),
						bloodType: user.bloodType,
						emergencyName: user.emergencyName,
						emergencyPhone: user.emergencyPhone,
					});
				}
			}
		}))

		return ids
	}



	return (
		<div className='absolute top-0 left-0 w-full h-full bg-black/50 z-50 flex justify-center items-center place-content-center'>
			<div className={`bg-white relative flex flex-col ${typeUser ? 'justify-between' : 'justify-center items-center'} p-4 md:p-10 pt-5 rounded-md max-w-7xl w-full min-h-[600px] mx-5 md:mx-10 mt-20 `}>
				<div className='flex items-center justify-between lg:mb-10'>
					{
						typeUser &&
						<>
							<ArrowLeft onClick={() => {
								if (userForm > 0) {
									setUserForm(userForm - 1)
									setUserWentBack(true)
								} else {
									setTypeUser(null)
								}
							}}
								className=' top-5 text-black left-5 hover:text-blueApp transition-colors cursor-pointer' />
							<span className='text-sm md:text-lg text-blueApp top-5 right-0 w-fit text-center left-0'>Formulario por persona: {userForm + 1} / {quantity}</span>
						</>
					}
					<div className={`flex gap-3 items-center ${!typeUser ? 'absolute' : ''} top-5 text-black right-5`}>
						<X onClick={() => setShowModal(false)} className=' hover:text-red-600 transition-colors cursor-pointer' />
					</div>
				</div>
				{
					titleEntity === 'Barranqui-IA' &&
					<div>
						{
							!typeUser && (
								<>
									<h2 className='text-base md:text-xl font-bold text-center'>¿Eres persona natural o vienes representando a una empresa?</h2>
									<div className='flex flex-col md:flex-row gap-2 justify-center my-5'>
										<button onClick={() => setTypeUser('personal')} className='bg-blueApp hover:bg-blueApp/80 py-2 px-5 text-white text-sm md:text-base font-semibold rounded-md'>Persona natural</button>
										<button onClick={() => setTypeUser('company')} className='bg-blueApp hover:bg-blueApp/80 py-2 px-5 text-white text-sm md:text-base font-semibold rounded-md'>Empresa</button>
									</div>
								</>
							)
						}
					</div>
				}
				{
					typeUser && (
						<form className='w-full flex flex-col lg:flex-row gap-6 pt-5'>
							<section className='flex flex-col w-full gap-6'>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center w-full items-center'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Nombre(s)</span>
										<input onChange={handleOnChangeInput} name="name" defaultValue='' value={formPerUser[userForm].name} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Nombres' />
									</label>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Apellido(s)</span>
										<input onChange={handleOnChangeInput} name="lastName" defaultValue='' value={formPerUser[userForm].lastName} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Apellidos' />
									</label>
								</div>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center w-full items-center'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Correo electrónico</span>
										<input onChange={handleOnChangeInput} name="email" defaultValue='' value={formPerUser[userForm].email} className='w-full text-sm border px-2 py-2 rounded-md' type="email" placeholder='Correo electrónico' />
									</label>
									{
										typeUser === 'company' && (
											<label className='flex flex-col gap-2 w-full'>
												<span className='text-sm'>NIT</span>
												<input onChange={handleOnChangeInput} name="nit" defaultValue='' value={formPerUser[userForm].nit} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='NIT' />
											</label>
										)
									}
								</div>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center w-full'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Cédula</span>
										<input onChange={handleOnChangeInput} name="idNumber" defaultValue='' value={formPerUser[userForm].idNumber} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Cédula' />
									</label>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Edad</span>
										<input onChange={handleOnChangeInput} name="age" value={formPerUser[userForm].age} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Edad' />
									</label>
								</div>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Teléfono WhatsApp</span>
										<input onChange={handleOnChangeInput} name="phone" defaultValue='' value={formPerUser[userForm].phone} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Teléfono WhatsApp' />
									</label>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Dirección y Barrio</span>
										<input onChange={handleOnChangeInput} name="address" defaultValue='' value={formPerUser[userForm].address} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Dirección y Barrio' />
									</label>
								</div>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Profesión u ocupación</span>
										<input onChange={handleOnChangeInput} name="occupation" defaultValue='' value={formPerUser[userForm].occupation} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Profesión u ocupación' />
									</label>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Empresa donde trabaja o estudia</span>
										<input onChange={handleOnChangeInput} name="company" defaultValue='' value={formPerUser[userForm].company} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Empresa donde trabaja o estudia' />
									</label>
								</div>
							</section>

							{/* <div className='w-1 h-full border-gray-300 border-dashed border-l'></div> */}

							<section className='flex gap-6 flex-col  w-full'>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center w-full'>
									{
										(titleEntity === 'Barranqui-IA' || slugProgram) &&
										<>
											<label className='flex flex-col gap-2 w-full'>
												<span className='text-sm'>Talla de camiseta</span>
												<select onChange={handleOnChangeInput} name="size" defaultValue={formPerUser[userForm].size} value={formPerUser[userForm].size} className='w-full text-sm border px-2 py-2 rounded-md'>
													<option value="">Talla de camiseta</option>
													<option value="XS">XS</option>
													<option value="S">S</option>
													<option value="M">M</option>
													<option value="L">L</option>
													<option value="XL">XL</option>
													<option value="XXL">XXL</option>
												</select>
											</label>
										</>
									}

									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Tipo de sangre</span>
										<input onChange={handleOnChangeInput} name="bloodType" defaultValue={formPerUser[userForm].bloodType} value={formPerUser[userForm].bloodType} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Tipo de sangre' />
									</label>
								</div>
								<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center'>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Nombre contancto  de emergencia</span>
										<input onChange={handleOnChangeInput} name="emergencyName" defaultValue={formPerUser[userForm].emergencyName} value={formPerUser[userForm].emergencyName} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='Nombre de emergencia' />
									</label>
									<label className='flex flex-col gap-2 w-full'>
										<span className='text-sm'>Contacto de emergencia</span>
										<input onChange={handleOnChangeInput} name="emergencyPhone" defaultValue={formPerUser[userForm].emergencyPhone} value={formPerUser[userForm].emergencyPhone} className='w-full text-sm border px-2 py-2 rounded-md' type="number" placeholder='Contacto de emergencia' />
									</label>

								</div>
								{
									titleEntity === 'Barranqui-IA' && (
										<>
											<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center'>
												<label className='flex flex-col gap-2 w-full'>
													<span className='text-sm'>¿Tiene alergias o intolerancias?</span>
													{/* <input onChange={handleOnChangeInput} name="isAllergic" defaultValue={formPerUser[userForm].isAllergic} value={formPerUser[userForm].isAllergic} className='w-full text-sm border px-2 py-2 rounded-md' type="text" placeholder='¿Tiene alergias o intolerancias?' /> */}
													<div className="flex justify-center gap-6 mt-2 text-gray-500">
														<label className="flex items-center gap-2 text-sm">
															SÍ
															<input
																onChange={handleOnChangeInput}
																name="isAllergic"
																type="radio"
																value="SI"
																checked={formPerUser[userForm].isAllergic === 'SI'}
															/>
														</label>
														<label className="flex items-center gap-2 text-sm">
															NO
															<input
																onChange={handleOnChangeInput}
																name="isAllergic"
																type="radio"
																value="NO"
																checked={formPerUser[userForm].isAllergic === 'NO'}
															/>
														</label>
													</div>
												</label>
												<label className="flex flex-col gap-2 w-full">
													<span className='text-sm'>
														¿Tienes alguna restricción alimenticia?
													</span>
													<select
														onChange={handleOnChangeInput}
														name="foodRestriction"
														defaultValue={formPerUser[userForm].foodRestriction}
														value={formPerUser[userForm].foodRestriction}
														className="px-2 py-2 rounded-md text-black border text-sm"
													>
														<option value="NONE">Ninguna</option>
														<option value="VEGETARIANO">Vegetariano</option>
														<option value="VEGANO">Vegano</option>
														<option value="KOSHER">Kosher</option>
													</select>
												</label>
											</div>
											<div className='flex flex-col md:flex-row gap-5 lg:gap-2 justify-center items-center'>
												<label htmlFor="" className='flex flex-col gap-2 w-full'>
													<span className='text-sm'>
														¿Llevas vehículo?
													</span>
													<div className="flex justify-center gap-6 mt-2 text-gray-500">
														<label className="flex items-center gap-2 text-sm">
															SÍ
															<input
																onChange={(e) => {
																	handleOnChangeInput(e),
																		setHasCar('SI')
																}}
																name={`hasCar`}
																type="radio"
																value="SI"
																checked={hasCar === 'SI'}
															/>
														</label>
														<label className="flex items-center gap-2 text-sm">
															NO
															<input
																onChange={(e) => {
																	handleOnChangeInput(e),
																		setHasCar('NO')
																}}
																name={`hasCar`}
																type="radio"
																value="NO"
																checked={hasCar === 'NO'}
															/>
														</label>
													</div>
												</label>
												{
													(hasCar === 'SI' || formPerUser[userForm]?.hasCar === 'SI') && (
														<label htmlFor="" className='flex flex-col gap-2 w-full'>
															<span className='text-sm'>Placa</span>
															<input onChange={handleOnChangeInput} name="carPlate" value={formPerUser[userForm]?.carPlate} type="text" className="px-2 py-2 rounded-md text-black border text-sm" />
														</label>
													)
												}
											</div>
										</>
									)
								}
							</section >
						</form >
					)
				}
				{
					typeUser && (
						<div className='flex flex-col gap-2 mt-10'>
							{error && (
								<p className="text-red-500 text-sm text-center">Todos los campos son requeridos</p>
							)
							}
							<button onClick={handleAddNewForm} disabled={disableButton} className='bg-blueApp hover:bg-blueApp/80 py-2 text-white text-base font-semibold my-2 rounded-md'>{userForm === quantity - 1 ? 'Ir a pagar' : 'Continuar'}</button>
						</div>
					)
				}
				<p className={`text-xs  mt-10 ${!typeUser && 'absolute bottom-5 left-0 right-0 '} text-gray-500 justify-center p-2 rounded-md flex items-center gap-2 animate-bounce`}> <Info className='inline w-10 h-10 md:w-4 md:h-4' />Al inscribirte {slugProgram ? 'al diplomado' : 'al evento'} aceptas términos y condiciones previstos por los organizadores</p>
			</div >
		</div >
	)
}
