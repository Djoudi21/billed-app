/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import $ from 'jquery';
import mockStore from '../__mocks__/store.js'
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore)
jest.mock('jquery');


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      const icons = await waitFor(() => screen.getAllByTestId('icon-window'))
      expect(icons[0].className).toEqual('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on eye icon", () => {
      test("Then function should be called", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the bills object
        const billsEntity = new Bills({document, onNavigate , mockStore, localStorageMock})
        //allows to get the view
        document.body.innerHTML = BillsUI({data: bills})
        //allows to get an icon
        const icon1  = screen.getAllByTestId('icon-eye')[0]
        //allows to spy on the billsEntity object and target the handleClickIconEye function
        //mockImplementation allows not to use the real function
        //const handleClickIconEye1 = jest.spyOn(billsEntity, 'handleClickIconEye').mockImplementation(() => {})

        //allows mocking the handleClickIconEye function
        //mockImplementation allows not to use the real function
        const handleClickIconEye1 = jest.fn(() => billsEntity.handleClickIconEye(icon1)).mockImplementation(() => {})
        icon1.addEventListener('click', handleClickIconEye1)
        userEvent.click(icon1)
        expect(handleClickIconEye1).toHaveBeenCalled()
      })
    })
    describe("When I click on new bill button", () => {
      test("Then function should be called", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the bills object
        const billsEntity = new Bills({document, onNavigate , mockStore, localStorageMock})
        //allows to get the view
        document.body.innerHTML = BillsUI({data: bills})
        //allows to get the button
        const button  = screen.getByTestId('btn-new-bill')
        //allows mocking the handleClickNewBill function
        //mockImplementation allows not to use the real function
        const handleClickNewBill = jest.fn(() => billsEntity.handleClickNewBill())
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
        expect(handleClickNewBill).toHaveBeenCalled()
      })
      test("Then i should be redirect to new bill page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        //allows to get the bills object
        const billsEntity = new Bills({document, onNavigate , mockStore, localStorageMock})
        //allows to get the view
        document.body.innerHTML = BillsUI({data: bills})
        //allows to get the button
        const button  = screen.getByTestId('btn-new-bill')
        //allows mocking the handleClickNewBill function
        const handleClickNewBill = jest.fn(() => billsEntity.handleClickNewBill())
        button.addEventListener('click', handleClickNewBill)
        userEvent.click(button)
        expect(document.body.innerHTML).toContain("Envoyer une note de frais")
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentTbody  = await screen.findAllByTestId("tbody")
      expect(contentTbody[0].children.length).toBe(bills.length)
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
      test("Then fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("Then fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})
