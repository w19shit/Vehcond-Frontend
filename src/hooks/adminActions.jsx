import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"; 
import { request } from "../components/utils/request"; 

// GET : Fetch ALL Departments
const fetchAllDepartmentAPI = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '',
        filterDeptCode = '',
        filterDeptName = '',
        filterIobsCode = '',
        sortConfig = { key: '', direction: '' } 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }
    if (filterDeptCode) {
        params.append('departmentCode', filterDeptCode);
    }
    if (filterDeptName) {
        params.append('departmentName', filterDeptName);
    }
    if (filterIobsCode) {
        params.append('departmentCodeIobs', filterIobsCode);
    }

    if (sortConfig && sortConfig.key && sortConfig.direction) {
        params.append('sort', `${sortConfig.key},${sortConfig.direction}`);
    }

    return request({
        url: `/department/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllDepartment = (
    pageNumber,
    pageSize,
    globalSearchTerm, 
    filterDeptCode,  
    filterDeptName,   
    filterIobsCode,   
    sortConfig    
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-department",
            pageNumber,
            pageSize,
            globalSearchTerm,
            filterDeptCode,
            filterDeptName,
            filterIobsCode,
            sortConfig
        ],
        queryFn: fetchAllDepartmentAPI,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};


//GET : Fetch ALL Districts
const fetchAllDistricts = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/districts/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllDistricts = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-districts",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllDistricts,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};
//GET : Fetch ALL Districts RTOs
const fetchAllDistrictRtos = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/district-rto/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllDistrictRtos = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-district-rtos",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllDistrictRtos,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//POST : Add Districts Rto
const AddDistrictRtos = (payload) => 
{
    return request ({
        url: `/district-rto/add-district-rto`,
        method: "post",
        data: payload,
    })
}

export const useAddDistrictRtos = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddDistrictRtos,
        onSuccess: (data, variables) => {
            console.log('District Rto inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-district-rtos'] 
            });
        },

        onError: (error, variables) => {
            console.log('District Rto insertion failed: ', error);
        },      
    });
};

//GET : Fetch ALL Financial Year
const fetchAllFinancialYear = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/financial-year/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllFinancialYear = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-financial-years",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllFinancialYear,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//POST : Add Financial Year
const AddFinancialYear = (payload) => 
{
    return request ({
        url: `/financial-year/add-financial-year`,
        method: "post",
        data: payload,
    })
}

export const useAddFinancialYear = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddFinancialYear,
        onSuccess: (data, variables) => {
            console.log('Financial Year inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-financial-year'] });
        },

        onError: (error, variables) => {
            console.log('Financial Year insertion failed: ', error);
        },      
    });
};

//GET : Fetch ALL Vehicle Manufacturer
const fetchAllVehicleManufacturers = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/vehicle-manufacturer/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllVehicleManufacturers = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-vehicle-manufacturers",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllVehicleManufacturers,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//GET : Fetch ALL Vehicle Type
const fetchAllVehicleType = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/vehicle-type/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllVehicleType = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-vehicle-type",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllVehicleType,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//GET : Fetch ALL Vehicle Part
const fetchAllVehiclePart = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/vehicle-parts/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllVehiclePart = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-vehicle-part",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllVehiclePart,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//GET : Fetch ALL Processes
const fetchAllProcesses = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '',
            
        sortField = 'processcode',
        sortDirection = 'asc' 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    if (sortField) {
        params.append('sort', `${sortField},${sortDirection}`);
    }

    return request({
        url: `/processes/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllProcesses = (
    pageNumber,
    pageSize,
    globalSearchTerm,
    sortConfig = { field: 'processcode', direction: 'asc' }
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-processes",
            pageNumber,
            pageSize,
            globalSearchTerm,
            sortConfig.field,
            sortConfig.direction,
        ],
        queryFn: fetchAllProcesses,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

//GET : Fetch ALL Roles
const fetchAllRoles = ({ queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '',
            
        // sortField = 'rolecode',
        // sortDirection = 'asc' 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    // if (sortField) {
    //     params.append('sort', `${sortField},${sortDirection}`);
    // }

    return request({
        url: `/role/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllRoles = (
    pageNumber,
    pageSize,
    globalSearchTerm,
    // sortConfig = { field: 'processcode', direction: 'asc' }
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-roles",
            pageNumber,
            pageSize,
            globalSearchTerm,
            // sortConfig.field,
            // sortConfig.direction,
        ],
        queryFn: fetchAllRoles,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

const fetchRoleForSelect = () =>
{
    return request ({
        url: `/role`,
        method: "get"
    })
}

export const useFetchRoleForSelect = () =>
{
    return useQuery ({
        queryKey: ["fetch-role-for-select"],
        queryFn: fetchRoleForSelect,
    })
}

//GET : Fetch ALL Enabled Users

const fetchAllEnabledUsers = ({queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/users/list/enabled?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllEnabledUsers = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-enabled-users",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllEnabledUsers,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};
//GET : Fetch ALL Disabled Users
const fetchAllDisabledUsers = ({queryKey }) => {
    const [
        _key, 
        page = 0,
        size = 10,
        globalSearch = '', 
    ] = queryKey;

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (globalSearch) {
        params.append('search', globalSearch);
    }

    return request({
        url: `/users/list/disabled?${params.toString()}`,
        method: "get",
    });
};

export const useFetchAllDisabledUsers = (
    pageNumber,
    pageSize,
    globalSearchTerm,  
) => {
    return useQuery({
        
        queryKey: [
            "fetch-all-disabled-users",
            pageNumber,
            pageSize,
            globalSearchTerm,
        ],
        queryFn: fetchAllDisabledUsers,
        keepPreviousData: true, 
        // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    });
};

// POST : ADD DEPARTMENTS
const AddDepartments = (payload) => 
{
    return request ({
        url: `/department/add-department`,
        method: "post",
        data: payload,
    })
}

export const useAddDepartments = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddDepartments,
        onSuccess: (data, variables) => {
            console.log('Department inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-departments'] });
        },

        onError: (error, variables) => {
            console.log('Department insertion failed: ', error);
        },      
    });
};

//POST : Add Districts
const AddDistricts = (payload) => 
{
    return request ({
        url: `/districts/add-districts`,
        method: "post",
        data: payload,
    })
}

export const useAddDistricts = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddDistricts,
        onSuccess: (data, variables) => {
            console.log('District inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-districts'] });
        },

        onError: (error, variables) => {
            console.log('District insertion failed: ', error);
        },      
    });
};





//POST : Add Vehicle Manufacturer
const AddVehicleManufacturer = (payload) => 
{
    return request ({
        url: `/vehicle-manufacturer/add-vehicle-manufacturer`,
        method: "post",
        data: payload,
    })
}

export const useAddVehicleManufacturer = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddVehicleManufacturer,
        onSuccess: (data, variables) => {
            console.log('Vehicle Manufacturer inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-vehicle-manufacturer'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Manufacturer insertion failed: ', error);
        },      
    });
};
//POST : Add Vehicle Type
const AddVehicleType = (payload) => 
{
    return request ({
        url: `/vehicle-type/add-vehicle-type`,
        method: "post",
        data: payload,
    })
}

export const useAddVehicleType = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddVehicleType,
        onSuccess: (data, variables) => {
            console.log('Vehicle Type inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-vehicle-type'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Type insertion failed: ', error);
        },      
    });
};
//POST : Add Vehicle Part
const AddVehiclePart = (payload) => 
{
    return request ({
        url: `/vehicle-parts/add-vehicle-parts`,
        method: "post",
        data: payload,
    })
}

export const useAddVehiclePart = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddVehiclePart,
        onSuccess: (data, variables) => {
            console.log('Vehicle Part inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-vehicle-part'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Part insertion failed: ', error);
        },      
    });
};
//POST : Add Processes
const AddProcesses = (payload) => 
{
    return request ({
        url: `/processes/add-processes`,
        method: "post",
        data: payload,
    })
}

export const useAddProcesses = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: AddProcesses,
        onSuccess: (data, variables) => {
            console.log('Processes inserted successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-all-processes'] });
        },

        onError: (error, variables) => {
            console.log('Processes insertion failed: ', error);
        },      
    });
};


// POST : Add Role
const addRoleNameRequest = (payload) => {
    return request({
        url: "/role/add-role",
        method: "post",
        data: payload,
    });
};

export const useAddRoleNameRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addRoleNameRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fetch-all-roles"] });
        },
        onError: (error) => {
            console.error("Role insertion failed: ", error);
        },
    });
};

//POST : Add Users
