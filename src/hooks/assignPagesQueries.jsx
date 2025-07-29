import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../components/utils/request";


const fetchAssignedRolePages = (roleCode) => {
    return request ({
        url : `/assigned-pages/${roleCode}`,
        method : "get", 
    })
}

export const useFetchAssignedRolePages = (roleCode) => {
    return useQuery ({
        queryKey: ['assignedPages', roleCode],
        queryFn: () => fetchAssignedRolePages(roleCode),
        enabled: !!roleCode,
    }) 
}

const assignPagesToRole = ({ roleCode, pageIds}) => {
    return request ({
        url: `/assign-pages/${roleCode}`,
        method: "post",
        data: {
            pageIds: pageIds,
        }
    })
}

export const useAssignPages = () => {
    
    const queryClient = useQueryClient();

    return useMutation ({
        mutationFn : assignPagesToRole,

        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['assignedPages']
            })
        },

        onError: (error) => {
            console.log('Assigning Pages failed');
        }
    })
}