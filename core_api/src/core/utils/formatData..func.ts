import {
  iRequestProjectMember,
  iRequestProjectMemberFormatted,
} from '../interface/member.interface';

/**
 * Formate une liste de membres d'un projet en les données attendues.
 * 
 * @param {iRequestProjectMember[]} rawMemberList - La liste de membres brutes.
 * @returns {iRequestProjectMemberFormatted[]} - La liste de membres formatées.
 */
export const formatProjectMemberList = (
  rawMemberList: iRequestProjectMember[],
): iRequestProjectMemberFormatted[] => {
  const memberList: iRequestProjectMemberFormatted[] = [];

  rawMemberList.forEach((rawMember) => {
    const member: iRequestProjectMemberFormatted = {
      id: rawMember.user.id,
      firstname: rawMember.user.firstname,
      lastname: rawMember.user.lastname,
      email: rawMember.user.email,
      role: rawMember.role,
      is_confirmed: rawMember.is_confirmed,
    };

    memberList.push(member);
  });

  return memberList;
};
