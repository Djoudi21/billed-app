/**
 * @jest-environment jsdom
 */

import {getByTestId, fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store.js'
import router from "../app/Router.js";
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then email icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const icon = await waitFor(() => screen.getByTestId('icon-mail'))
      expect(icon.className).toEqual('active-icon')
    })
    describe("When I click on submit button", () => {
      test("Then function should be called", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the view
        document.body.innerHTML = NewBillUI()
        //allows to get the bills object
        const newBillEntity = new NewBill({document, onNavigate , mockStore, localStorageMock})
        //allows to get the button
        const button  = document.getElementById('btn-send-bill')
        const form  = screen.getByTestId('form-new-bill')
        //allows mocking the handleClickNewBill function
        //mockImplementation allows not to use the real function
        const handleSubmitNewBill = jest.fn((e) => newBillEntity.handleSubmit(e))
        form.addEventListener('submit', handleSubmitNewBill)
        userEvent.click(button)
        expect(handleSubmitNewBill).toHaveBeenCalled()
      })
      test("Then i should be redirect to bills page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the view
        document.body.innerHTML = NewBillUI()
        //allows to get the bills object
        const newBillEntity = new NewBill({document, onNavigate , mockStore, localStorageMock})
        //allows to get the button
        const button  = document.getElementById('btn-send-bill')
        const form  = screen.getByTestId('form-new-bill')
        //allows mocking the handleClickNewBill function
        const handleSubmitNewBill = jest.fn((e) => newBillEntity.handleSubmit(e))
        // add event listener
        form.addEventListener('submit', handleSubmitNewBill)
        // trigger event
        userEvent.click(button)
        expect(document.body.innerHTML).toContain("Mes notes de frais")
      })
    })
    describe("When I click on input file", () => {
      test("Then functions should be called", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the view
        document.body.innerHTML = NewBillUI()
        //allows to get the bills object
        const newBillEntity = new NewBill({document, onNavigate , mockStore, localStorageMock})
        //allows to get the button
        const inputFile = screen.getByTestId('file')
        //allows mocking the handleClickNewBill function
        //mockImplementation allows not to use the real function
        const handleChangeFile = jest.fn((e) => newBillEntity.handleChangeFile(e))
        // add event listener
        inputFile.addEventListener('change', handleChangeFile)
        // trigger event
        fireEvent.change(inputFile)
        expect(handleChangeFile).toHaveBeenCalled()
      })
    })
  })
})


// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I create a new Bill", () => {
    test("send POST request from mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const data =  await waitFor(() => mockStore.bills().update())
      expect(data).toStrictEqual({
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      })
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("Then post a new bill to an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.NewBill)

        await new Promise(process.nextTick);
       // const message = await screen.getByText(/Erreur 404/)
        //expect(message).toBeTruthy()
      })

      test("Then fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        window.onNavigate(ROUTES_PATH.NewBill)
        await new Promise(process.nextTick);
        //const message = await screen.getByText(/Erreur 500/)
        //expect(message).toBeTruthy()
      })
    })
  })
})
