class DataTab {
    getDataPanel() {
        return cy.get('[data-test=Data-panel]');
    }
    getDataTable() {
        return cy.get('.data-table');
    }
    getDataTableRows() {
        return this.getDataTable().find('tbody tr');
    }
    getDataTableContents() {
        return this.getDataTableRows().find('td');
    }
}

export default DataTab;
