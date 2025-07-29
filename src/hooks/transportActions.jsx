import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../components/utils/request"


//GET: Pending Transport Action
const fetchPendingActionWithMviReport = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-review/with-mvi?${params.toString()}`,
        method: "get",
    })
}

export const useFetchPendingActionWithMviReport = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-pending-approval-with-mvi-report", pageNumber, pageSize, searchTerm],
        queryFn: fetchPendingActionWithMviReport,
        keepPreviousData: true,
    })   
}

//GET: Pending Transport Action Without MVI Report
const fetchPendingActionWitouthMviReport = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-review/without-mvi?${params.toString()}`,
        method: "get",
    })
}

export const useFetchPendingActionWithoutMviReport = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-pending-approval-without-mvi-report", pageNumber, pageSize, searchTerm],
        queryFn: fetchPendingActionWitouthMviReport,
        keepPreviousData: true,
    })   
}

//POST: APPROVAL
const ApproveVehicle = ({data}) => 
{
    return request ({
        url: `/transport-review/approve`,
        method: "post",
        data: data,
    })
}

export const useApproveVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: ApproveVehicle,
        onSuccess: (data, variables) => {
            console.log('Vehicle approval successful: ', data);

            queryClient.invalidateQueries({
                queryKey: ['fetch-pending-approval-with-mvi'] });

            queryClient.invalidateQueries({
                queryKey: ['fetch-pending-approval-without-mvi'] 
            });
        },

        onError: (error, variables) => {
            console.log('Vehicle Approval failed: ', error);
        },      
    });
};

//POST: REJECT
const RejectVehicle = ({applicationcode, data}) => {

    if(!data)
    {
        console.error("Reject data (ReturnedRequestData) is required but was not provided");
        throw new Error("Rejection data is required.");
    }

    return request ({
        url: `/transport-review/reject/${applicationcode}`,
        method: "post",
        data: data
    });
}

export const useRejectVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: RejectVehicle,
        onSuccess: (data, variables) => {
            console.log('Vehicle rejection successful: ', data);

            queryClient.invalidateQueries({ queryKey: ['fetch-pending-approval-with-mvi']});
            queryClient.invalidateQueries({ queryKey: ['fetch-pending-approval-without-mvi'] });
        },

        onError: (data, variables) => {
            console.error('Vehicle rejection failed: ', error);
        }
    })
}

//GET: Approved Vehicle
const fetchPlaceBeforeVcc = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = '', year, month] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });
         
    if(search)
    {
        params.append('search', search);
    }

    if(year != null && year !== '')
    {
        params.append('year', year);
    }

    if(month != null && month !== '')
    {
        params.append('month', month);
    }

    return request ({
        url: `/transport-placement/list?${params.toString()}`,
        method: "get",
    });
};

export const useFetchPlaceBeforeVcc = (pageNumber, pageSize, searchTerm, year, month) => {
    return useQuery ({
        queryKey: ["fetch-place-before-vcc", pageNumber, pageSize, searchTerm, year, month],
        queryFn: fetchPlaceBeforeVcc,
        keepPreviousData: true,
    })   
}

//POST : FORWARDING VEHICLE
const placeVehicleBeforeVcc = ({data}) => 
{
    return request ({
        url: `/transport-placement/place-before-vcc`,
        method: "post",
        data: data,
    })
}

export const usePlaceVehicleBeforeVcc = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: placeVehicleBeforeVcc,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Forward successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-place-before-vcc'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Forward failed: ', error);
        },      
    });
};

// GET: Vehicle to Be Priced/ Currently under VCC
const fetchPriceFixedByTc = ({queryKey}) => {
    const [_key, page = 0, size=10, search = '', year, month] = queryKey;

    const params = new URLSearchParams ({
        page: page.toString(),
        size: size.toString(),
    })

    if(search)
    {
        params.append('search', search);
    }

    if(year != null && year !== '')
    {
        params.append('year', year);
    }

    if(month != null && month !== '')
    {
        params.append('month', month);
    }

    return request ({
        url: `/transport-price-fixation/placed-before-vcc?${params.toString()}`,
        method: "get"
    })
}

export const useFetchPriceFixedByTc = (pageNumber, pageSize, searchTerm, year, month) => {
    return useQuery ({
        queryKey: ['fetch-price-fixed-by-tc', pageNumber, pageSize, searchTerm, year, month],
        queryFn: fetchPriceFixedByTc,
        keepPreviousData: true,
    })
}

// POST
const priceVehicle = ({data}) => 
{
    return request ({
        url: `/transport-price-fixation/fixing-price`,
        method: "post",
        data: data,
    })
}

export const usePriceVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: priceVehicle,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Priced successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-price-fixed-by-tc'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Pricing failed: ', error);
        },      
    });
};

// GET : Vehicle to be allotted
const fetchToBeAllotted = ({ queryKey}) => {
    const [_key, page = 0, size = 10, search = '', year, month] = queryKey;

    const params = new URLSearchParams ({
        page: page.toString(),
        size: size.toString(),
    })

    if(search)
    {
        params.append('search', search);
    }

    if(year != null && year !== '')
    {
        params.append('year', year);
    }

    if(month != null && month !== '')
    {
        params.append('month', month);
    }

    return request ({
        url: `/transport-allotment/priced?${params.toString()}`,
        method: "get"
    })
}

export const useFetchToBeAllotted = (pageNumber, pageSize, searchTerm, year, month) => {
    return useQuery ({
        queryKey: ['fetch-to-be-allotted', pageNumber, pageSize, searchTerm, year, month],
        queryFn: fetchToBeAllotted,
        keepPreviousData: true,
    })
}

//POST : ALLOTTING VEHICLE
const allotingVehicle = ({data}) => 
{
    return request ({
        url: `/transport-allotment/allot`,
        method: "post",
        data: data,
    })
}

export const useAllotingVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: allotingVehicle,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Allotted successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-to-be-allotted'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Allotment failed: ', error);
        },      
    });
};

//Allotted Vehicles
const fetchAllottedVehicles = ({ queryKey}) => {
    const [_key, page = 0, size = 10, search = '', year, month] = queryKey;

    const params = new URLSearchParams ({
        page: page.toString(),
        size: size.toString(),
    })

    
    if(search)
    {
        params.append('search', search);
    }

    if(year != null && year !== '')
    {
        params.append('year', year);
    }

    if(month != null && month !== '')
    {
        params.append('month', month);
    }

    return request ({
        url: `/transport-lifting/allotted-list?${params.toString()}`,
        method: "get"
    })
}

export const useFetchAllottedVehicles = (pageNumber, pageSize, searchTerm, year, month) => {
    return useQuery ({
        queryKey: ['fetch-allotted-vehicles', pageNumber, pageSize, searchTerm, year, month],
        queryFn: fetchAllottedVehicles,
        keepPreviousData: true,
    })
}


// GET: Heavy Vehicle.
const fetchHeavyVehicles = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-action/heavy-vehicles?${params.toString()}`,
        method: "get",
    })
}

export const useFetchHeavyVehicle = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-heavy-vehicles", pageNumber, pageSize, searchTerm],
        queryFn: fetchHeavyVehicles,
        keepPreviousData: true,
    })   
}

//POST Tender Vehicle
const tenderingVehicle = ({data}) => 
{
    return request ({
        url: `/transport-action/declare-tender`,
        method: "post",
        data: data,
    })
}

export const useTenderingVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: tenderingVehicle,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Tendered successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-heavy-vehicle'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Tendering failed: ', error);
        },      
    });
};

//POST Scrap Vehicle
const scrapingVehicle = ({data}) => 
{
    return request ({
        url: `/transport-action/declare-scrap`,
        method: "post",
        data: data,
    })
}

export const useScrapingVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: scrapingVehicle,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Forward successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-heavy-vehicle'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Forward failed: ', error);
        },      
    });
};

//GET - Lifted Vehicles
const fetchLiftedVehicle = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-lifting/lifted-vehicles?${params.toString()}`,
        method: "get",
    })
}

export const useFetchLiftedVehicle = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-lifted-vehicles", pageNumber, pageSize, searchTerm],
        queryFn: fetchLiftedVehicle,
        keepPreviousData: true,
    })   
}
//GET Non - lifted Vehicle
const fetchNonLiftedVehicle = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-non-lifted/list?${params.toString()}`,
        method: "get",
    })
}

export const useFetchNonLiftedVehicle = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-non-lifted-vehicles", pageNumber, pageSize, searchTerm],
        queryFn: fetchNonLiftedVehicle,
        keepPreviousData: true,
    })   
}




//GET - Tendered Vehicles
const fetchTenderedVehicles = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = '', year, month] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }
     if(year != null && year !== '')
    {
        params.append('year', year);
    }

    if(month != null && month !== '')
    {
        params.append('month', month);
    }
    return request ({
        url: `/transport-action/tendered-vehicles?${params.toString()}`,
        method: "get",
    })
}

export const useFetchTenderedVehicle = (pageNumber, pageSize, searchTerm, year, month) => {
    return useQuery ({
        queryKey: ["fetch-tendered-vehicles", pageNumber, pageSize, searchTerm, year, month],
        queryFn: fetchTenderedVehicles,
        keepPreviousData: true,
    })   
}

//GET - Scrapped Vehicles
const fetchScrappedVehicles = ({ queryKey }) => {
    const [_key, page = 0, size = 10, search = ''] = queryKey;
    
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if(search)
    {
        params.append('search', search);
    }

    return request ({
        url: `/transport-action/scrapped-vehicles?${params.toString()}`,
        method: "get",
    })
}

export const useFetchScrappedVehicle = (pageNumber, pageSize, searchTerm) => {
    return useQuery ({
        queryKey: ["fetch-scrapped-vehicles", pageNumber, pageSize, searchTerm],
        queryFn: fetchScrappedVehicles,
        keepPreviousData: true,
    })   
}

// POST : Lift Vehicle
const liftingVehicle = ({data}) => 
{
    return request ({
        url: `/transport-lifting/lift`,
        method: "post",
        data: data,
    })
}

export const useLifitngVehicle = () => {

    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn: liftingVehicle,

        onSuccess: (responseData, variables) => {
            console.log('Vehicle Lifted successful: ', responseData);

            queryClient.invalidateQueries({
                queryKey: ['fetch-allotted-vehicles'] });
        },

        onError: (error, variables) => {
            console.log('Vehicle Lifting failed: ', error);
        },      
    });
};


const fetchVehicleDetailsByCode = (applicationcode) => {
    return request({
        url : `/final-submit/details/${applicationcode}`,
        method: "get",
    })
}

export const useFetchVehicleDetails = (applicationcode) => {
    return useQuery ({
        queryKey: ["fetch-vehicle-details", applicationcode],
        queryFn: () => fetchVehicleDetailsByCode(applicationcode),
        enabled: !!applicationcode,
    })
}